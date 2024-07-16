import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Input, Button, VStack, FormControl, FormLabel, FormErrorMessage, useToast, Flex, Avatar } from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import OtpInput from 'react-otp-input';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@chakra-ui/react';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};



export default function LinkeAccount() {
  const { handleSubmit, control, watch, formState: { errors } } = useForm();
  const toast = useToast();
  const [info, setInfo] = useState({});
  const api = useAxiosPrivate();
  const [verificationId, setVerificationId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const { logout } = useAuth()
  const [verifyingLoader, setVerifyingLoader] = useState(null)
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const nav = useNavigate()
  const [accountsMessage, setAccountsMessage] = useState("")
  const [otp, setOtp] = useState("");
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(null);
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(null)
  const [canCreate, setCanCreate] = useState(null)
  const [availableAccounts, setAvailableAccounts] = useState([])

  const onCaptchVerify = async () => {
    try {
      const recaptcha = new RecaptchaVerifier(auth, 'recaptcha', {})
      const confirmation = await signInWithPhoneNumber(auth, `+91${watch('phoneNumber')}`, recaptcha)
      setUser(confirmation)
      setShowOTP(true)
      setLoading(false)
    } catch (error) {
      console.log(error)
    }
  }


  const onOTPVerify = async () => {
    setLoading(true);
    try {
      await user.confirm(otp);

      const verifyResponse = await api.put('/api/user/verify-number', { phoneNumber: info.phoneNumber });
      if (!verifyResponse.ok) {
        throw new Error('Failed to verify phone number');
      }
      console.log('Phone number verified successfully.');
      setShowOTP(!showOTP)
      setOtp("")

    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
    api
      .get("/api/user/profile")
      .then(({ data }) => {
        setInfo(data);
      })
      .catch((error) => {
        setInfo(null);
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (info?.phoneNumberVerified) {
      setIsVerified(!isVerified);


      const fetchNumberOfAccounts = async () => {
        try {
          const { data } = await api.post('/api/user/get-no-accounts', { phoneNumber: info.phoneNumber });


          setCanCreate(data.canCreate);
          setAccountsMessage(data.message)
          setAvailableAccounts(data.accounts)
        } catch (error) {
          console.error('Error fetching number of accounts:', error);
          setCanCreate(null);
          setAccountsMessage("")
        }
      };

      fetchNumberOfAccounts();
    } else {
      setIsVerified(false);
      setCanCreate(null);
      setAccountsMessage("")
    }
  }, [info?.phoneNumberVerified]);

  const onSubmit = async (data) => {
    setLoading(true)
    onCaptchVerify()

  };
  const accounts = [
    {
      id: 1,
      avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      userName: 'John Doe',
      email: 'john.doe@example.com',
    },
    {
      id: 2,
      avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      userName: 'Jane Smith',
      email: 'jane.smith@example.com',
    },
  ];

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', padding: '6px' }}>
      {
        !isVerified && info ? (
          <div style={{ padding: '8px', borderRadius: 'md', width: '100%', maxWidth: 'md', width: '50%' }}>
            <h2 style={{ textAlign: 'center', color: '#38B2AC', fontSize: '1.5rem', marginBottom: '1.5rem' }}>Link Your Accounts</h2>
            <p style={{ textAlign: 'center', color: '#4A5568', marginBottom: '1.5rem' }}>
              {info.phoneNumber
                ? `Your phone number is ${info.phoneNumber}, you can link another account to this phone number.`
                : 'Loading your information...'}
            </p>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: showOTP ? 'center' : 'flex-start', gap: '1rem' }}>
                {showOTP ? (
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span>-</span>}
                    renderInput={(props) => <input {...props} style={{ width: '3rem', height: '3rem', margin: '0 0.5rem', fontSize: '1.5rem', textAlign: 'center', border: '1px solid #CBD5E0', borderRadius: '0.375rem' }} />}
                  />
                ) : (
                  <>
                    <label htmlFor="phoneNumber" style={{ marginBottom: '0.5rem', color: '#4A5568' }}>Phone Number</label>
                    <Controller
                      name="phoneNumber"
                      control={control}
                      rules={{ required: "Phone number is required" }}
                      render={({ field }) => (
                        <input
                          id="phoneNumber"
                          placeholder="Enter your phone number"
                          {...field}
                          style={{ width: '100%', padding: '0.5rem', border: errors.phoneNumber ? '1px solid #E53E3E' : '1px solid #CBD5E0', borderRadius: '0.375rem' }}
                        />
                      )}
                    />
                    {errors.phoneNumber && <span style={{ color: '#E53E3E', fontSize: '0.75rem' }}>{errors.phoneNumber.message}</span>}
                  </>
                )}
              </div>
              {!showOTP ? (
                <button type="submit" style={{ backgroundColor: '#38B2AC', color: 'white', width: '100%', padding: '0.75rem', borderRadius: '0.375rem', cursor: 'pointer', marginTop: '1rem' }}>
                  {loading ? <Spinner /> : null} Link Account
                </button>
              ) : (
                <button type="button" onClick={onOTPVerify} style={{ backgroundColor: '#38B2AC', color: 'white', width: '100%', padding: '0.75rem', borderRadius: '0.375rem', cursor: 'pointer', marginTop: '1rem' }}>
                  {loading ? <Spinner /> : null} Verify OTP
                </button>
              )}
            </form>
          </div>
        ) : (
          <Flex w={'100%'} h={'100%'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'}>
            <Text>{accountsMessage}</Text>
            <Flex w="40%" direction="column">
              {availableAccounts.map((account, i) => (
                <Flex key={i} alignItems="center" p={4} borderBottom="1px solid #ccc">
                  <Avatar src={account.profile_photo} size="md" />
                  <Box ml={4}>
                    <Text fontWeight="bold">{account.userName}</Text>
                    <Text color="gray.500">{account.email}</Text>
                  </Box>
                </Flex>
              ))}
            </Flex>
            {canCreate && (
              <Button onClick={() => { logout(); nav('/signup') }} mt={4} colorScheme="teal">
                Create another account
              </Button>
            )}
          </Flex>
        )
      }

      <div id='recaptcha'></div>
    </div>
  );

}
