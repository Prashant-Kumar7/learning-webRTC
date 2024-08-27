import { useEffect, useRef, useState } from "react"

export const Sender = () => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [pc, setPC] = useState<RTCPeerConnection | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);


    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        setSocket(socket);
        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'sender'
            }));
        }

        console.log(socket)
    }, []);

    const initiateConn = async () => {

        if(socket){

            socket.onmessage = async (event) => {
                const message = JSON.parse(event.data);
                if (message.type === 'createAnswer') {
                    console.log("recevier sdp: " + message.sdp)
                    await pc.setRemoteDescription(message.sdp);
                } else if (message.type === 'iceCandidate') {
                    console.log("recevier candidates :" + message.candidate)
                    pc.addIceCandidate(message.candidate);
                }
            }
        }else {
            console.log("no socket")
        }


        const pc = new RTCPeerConnection();
        setPC(pc);
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket?.send(JSON.stringify({
                    type: 'iceCandidate',
                    candidate: event.candidate
                }));
            }
        }

        pc.onnegotiationneeded = async () => {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            socket?.send(JSON.stringify({
                type: 'createOffer',
                sdp: pc.localDescription
            }));
        }
            
        getCameraStreamAndSend(pc);
    }

    const getCameraStreamAndSend = (pc: RTCPeerConnection) => {
        navigator.mediaDevices.getUserMedia({ video: true , audio : true }).then((stream) => {

            if(videoRef.current){
                videoRef.current.srcObject = stream
                videoRef.current.play()
            }

            stream.getTracks().forEach((item)=>{
                pc.addTrack(item,stream)
            })            
        });
    }

    return <div>
        Sender
        <button onClick={initiateConn}> Send data </button>
        <video muted ref={videoRef}></video>
    </div>
}