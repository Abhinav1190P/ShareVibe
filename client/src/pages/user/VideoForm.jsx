export default function VideoForm(props) {
  const { AppID, setAppID, channelName, setChannelName, token, setToken, setInCall } = props;
  return (
    <div>
      <p>Please enter your Agora AppID and Channel Name</p>
      <label htmlFor="appid">Agora App ID: </label>
      <input id="appid" type="text" value={AppID} onChange={(e) => setAppID(e.target.value)} placeholder="required"/>
      <br /><br />
      <label htmlFor="channel">Channel Name: </label>
      <input id="channel" type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="required" />
      <br /><br />
      <label htmlFor="token">Channel Token: </label>
      <input id="token" type="text" value={token} onChange={(e) => setToken(e.target.value)} placeholder="optional" />
      <br /><br />
      <button onClick={() => AppID && channelName ? setInCall(true) : alert("Please enter Agora App ID and Channel Name")}>
        Join
      </button>
    </div>
  );
}