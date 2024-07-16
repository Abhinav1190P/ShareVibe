from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
import numpy as np
import librosa
import soundfile as sf
import io
from keras.models import load_model
from scipy.signal import butter, lfilter
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import os
app = FastAPI()
origins = [
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

windowLength = 255
fftLength = 255
hop_length = 63
frame_length = 8064
debug_flag = False
filtering_flag = True

model = load_model('model.h5')

CHUNK = 8064
RATE = 22050
samp_interv = CHUNK

def convert_to_stft(data):
    data_stft = librosa.stft(data, n_fft=fftLength, hop_length=hop_length)
    data_stft_mag, data_stft_phase = librosa.magphase(data_stft)
    if debug_flag:
        print("STFT shape:")
        print(data_stft_mag.shape)
    data_stft_mag_db = librosa.amplitude_to_db(data_stft_mag, ref=np.max)
    data_stft_mag_db_scaled = (data_stft_mag_db + 80) / 80
    data_stft_mag_db_scaled = np.reshape(data_stft_mag_db_scaled, (1, data_stft_mag_db_scaled.shape[0], data_stft_mag_db_scaled.shape[1], 1))
    return data_stft_mag_db_scaled, data_stft_mag, data_stft_phase

def convert_to_time_domain(predicted_clean, data_stft_phase, data_stft_mag):
    predicted_mag_db_unscaled = (predicted_clean * 80) - 80
    predicted_mag = librosa.db_to_amplitude(predicted_mag_db_unscaled, ref=np.max(data_stft_mag))
    predicted_stft = predicted_mag * data_stft_phase
    predicted_final = librosa.istft(predicted_stft, hop_length=hop_length, length=frame_length)
    if debug_flag:
        print("Predicted final shape: ")
        print(predicted_final.shape)
    return predicted_final

def run_denoiser(noisy_sample):
    data_stft_mag_db_scaled, data_stft_mag, data_stft_phase = convert_to_stft(noisy_sample)
    predicted_clean = model.predict(data_stft_mag_db_scaled)

    if debug_flag:
        print("Predicted: ")
        print(predicted_clean.shape)
    predicted_clean = np.reshape(predicted_clean, (predicted_clean.shape[1], predicted_clean.shape[2]))

    output_clean = convert_to_time_domain(predicted_clean, data_stft_phase, data_stft_mag)

    if filtering_flag:
        if np.max(output_clean) < 0.01:
            lo, hi = 300, 1000
            if np.max(output_clean) < 0.005:
                lo, hi = 1000, 1500
            b, a = butter(N=6, Wn=[2 * lo / RATE, 2 * hi / RATE], btype='band')
            x = lfilter(b, a, output_clean)
            output_clean = np.float32(x)

        lo, hi = 50, 2000
        b, a = butter(N=6, Wn=[2 * lo / RATE, 2 * hi / RATE], btype='band')
        x = lfilter(b, a, output_clean)
        output_clean = np.float32(x)
    
    return output_clean

@app.post("/noise_reducer/")
async def create_upload_file(file: UploadFile = File(...)):
    if file.content_type != "audio/wav":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a WAV file.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
        temp_file.write(await file.read())
        temp_file_path = temp_file.name

    noisy_sample_test_split = []
    clean_audio_array = []
    try:
        file_data, noise_sample_sr = librosa.load(temp_file_path)
        for j in range(samp_interv, len(file_data), samp_interv):
            k = j - samp_interv
            noisy_sample_test_split.append(file_data[k:j])

        noisy_sample_test_split = np.array(noisy_sample_test_split)

        for i in range(len(noisy_sample_test_split)):
            clean_audio = run_denoiser(noisy_sample_test_split[i])
            clean_audio_array.append(clean_audio)

        clean_audio_array = np.array(clean_audio_array)
        clean_wav = np.reshape(clean_audio_array, (clean_audio_array.shape[0] * clean_audio_array.shape[1]))

        buffer = io.BytesIO()
        sf.write(buffer, clean_wav, RATE, format='WAV')
        buffer.seek(0)
    finally:
        os.unlink(temp_file_path)

    return StreamingResponse(buffer, media_type="audio/wav", headers={"Content-Disposition": "attachment;filename=cleaned_audio.wav"})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
