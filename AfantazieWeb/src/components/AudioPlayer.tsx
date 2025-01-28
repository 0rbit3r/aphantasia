
interface AudioPlayerProps {
  path: string;
}

function AudioPlayer(props: AudioPlayerProps) {
  return (
    <div>
      <audio controls>
        <source src={props.path} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default AudioPlayer;