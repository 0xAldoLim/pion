let audio:AudioContext|undefined;
export function playSound(capture=false,mate=false){
  try{audio??=new AudioContext();if(audio.state==='suspended')void audio.resume();const gain=audio.createGain();gain.connect(audio.destination);gain.gain.setValueAtTime(0.08,audio.currentTime);gain.gain.exponentialRampToValueAtTime(0.001,audio.currentTime+0.1);const oscillator=audio.createOscillator();oscillator.type='triangle';oscillator.frequency.setValueAtTime(mate?660:capture?240:420,audio.currentTime);oscillator.connect(gain);oscillator.start();oscillator.stop(audio.currentTime+0.12);}catch{/* Sound is optional when the browser blocks audio. */}
}
