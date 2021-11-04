const turnOnCameraButton = document.querySelector('#turnOnCameraButton')
const takePictureButton = document.querySelector('#takePictureButton')
const statusBar = document.querySelector('#status')
const takenPicture = document.querySelector('#takenPicture')

if( 'mediaDevices' in navigator ) {

	turnOnCameraButton.addEventListener('click', turnCameraOn)
}


async function turnCameraOn() {
	const constraints = {
		video: { width: 100, height: 200 }

	}
	const md = navigator.mediaDevices
	console.log('About to ask for video');
	try {
		const stream = await md.getUserMedia(constraints)
		console.log('We got a stream object', stream);

		const imageCapture = new ImageCapture(stream.getVideoTracks()[0])
		let blob = await imageCapture.takePhoto()
		takenPicture.src = URL.createObjectURL(blob)

	} catch(error) {
		// Vi kan säkert komma på ett mer användarvänligt felmeddelande...
		statusBar.innerHTML = "Didn't get permission to use the camera."
		console.log('Failed to get video. ' + error.message);
	}
}