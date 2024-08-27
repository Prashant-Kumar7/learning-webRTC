import { useEffect, useRef, useState } from "react"


export const Receiver = () => {
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        console.log(socket)
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'receiver'
            }));
        }
        startReceiving(socket);
    }, []);


    

    function startReceiving(socket: WebSocket) {


        const pc = new RTCPeerConnection();
        pc.ontrack = async(event) => {
            console.log(event.streams)

            const allTracks = event.streams[0].getTracks()
                if(videoRef.current){
                    videoRef.current.srcObject = new MediaStream(allTracks);
                    videoRef.current.play()
                }

                if(audioRef.current){
                    audioRef.current.srcObject = new MediaStream(allTracks)
                    audioRef.current.play()
                }
                document.querySelector("button")?.click()
            // })



        }

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'createOffer') {

                console.log("reciver sdp :" + message.sdp)

                pc.setRemoteDescription(message.sdp).then(() => {
                    pc.createAnswer().then((answer) => {
                        pc.setLocalDescription(answer);
                        socket.send(JSON.stringify({
                            type: 'createAnswer',
                            sdp: answer
                        }));
                    });
                });
            } else if (message.type === 'iceCandidate') {
                console.log("recevier candidates :" + message.candidate)
                pc.addIceCandidate(message.candidate);
            }
        }
    }

    return <div onMouseMove={()=>audioRef.current?.play()}>
        recevier
        <video autoPlay muted ref={videoRef}></video>
        <audio autoPlay ref={audioRef}></audio>
        <button onClick={()=>audioRef.current?.play()}>audio</button>
    </div>
}