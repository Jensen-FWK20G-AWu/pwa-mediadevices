const turnOnCameraButton = document.querySelector('#turnOnCameraButton')
const turnOffCameraButton = document.querySelector('#turnOffCameraButton')
const takePictureButton = document.querySelector('#takePictureButton')
const statusBar = document.querySelector('#status')
const takenPicture = document.querySelector('#takenPicture')
const videoElement = document.querySelector('#cameraVideo')

if( 'mediaDevices' in navigator ) {

	turnOnCameraButton.addEventListener('click', turnCameraOn)
	turnOffCameraButton.addEventListener('click', turnCameraOff)
	takePictureButton.addEventListener('click', takePicture)
}


let videoStream = null;

function turnCameraOff() {
	if( !videoStream )
		return;

	// Hämta alla spår från kameraströmmen
	// Avsluta dem var och en
	let tracks = videoStream.getTracks()
	tracks.forEach(track => track.stop())
	// videoElement.srcObject = null

	turnOffCameraButton.disabled = true
	turnOnCameraButton.disabled = false
	takePictureButton.disabled = true
}

async function turnCameraOn() {
	const constraints = {
		video: { width: 320, height: 240 }

	}
	const md = navigator.mediaDevices
	console.log('About to ask for video');
	try {
		videoStream = await md.getUserMedia(constraints)
		console.log('We got a stream object', videoStream);

		// Nu har vi fått tillgång till kamerans dataström
		turnOffCameraButton.disabled = false
		turnOnCameraButton.disabled = true
		takePictureButton.disabled = false

		videoElement.srcObject = videoStream
		videoElement.addEventListener('loadedmetadata', () => {
			// Detta event körs när tillräckligt mycket av strömmen har laddats
			// Buffring: ladda ner bitar av en videofil, när vi har tillräckligt mycket kan vi börja visa video
			videoElement.play()

			takePictureButton.disabled = false
		})
	} catch(error) {
		// Vi kan säkert komma på ett mer användarvänligt felmeddelande...
		statusBar.innerHTML = "Didn't get permission to use the camera."
		console.log('Failed to get video. ' + error.message);
	}
}

async function takePicture() {
	// Ta en enstaka bild
	const imageCapture = new ImageCapture(videoStream.getVideoTracks()[0])
	let blob = await imageCapture.takePhoto()
	takenPicture.src = URL.createObjectURL(blob)
}