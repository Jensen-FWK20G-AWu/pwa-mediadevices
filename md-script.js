const turnOnCameraButton = document.querySelector('#turnOnCameraButton')
const turnOffCameraButton = document.querySelector('#turnOffCameraButton')
const takePictureButton = document.querySelector('#takePictureButton')
const cameraFacingButton = document.querySelector('#cameraFacingButton')
const startRecordingButton = document.querySelector('#startRecordingButton')
const stopRecordingButton = document.querySelector('#stopRecordingButton')
const statusBar = document.querySelector('#status')
const takenPicture = document.querySelector('#takenPicture')
const videoElement = document.querySelector('#cameraVideo')
const downloadPara = document.querySelector('#downloadPara')

// Kontrollera först om webbläsaren över huvud taget kan använda MediaDevices. Alla större webbläsare kan det - men ha som vana att alltid kontrollera. Andra Web API som vi kan vilja använda har sämre stöd. PS. om du inte ser slutet på den här raden utan att scrolla, behöver du slå på WORD WRAP i editorn: https://github.com/lejonmanen/git-instruktion/blob/main/vscode-settings.md#vs-code-rekommenderade-inst%C3%A4llningar
if( 'mediaDevices' in navigator ) {
	turnOnCameraButton.addEventListener('click', turnCameraOn)
	turnOffCameraButton.addEventListener('click', turnCameraOff)
	takePictureButton.addEventListener('click', takePicture)
	cameraFacingButton.addEventListener('click', changeFacing)
	startRecordingButton.addEventListener('click', startRecording)
	stopRecordingButton.addEventListener('click', stopRecording)
}
// TODO: else-fallet, visa lämpligt felmeddelande för användaren

// Globala variabler, nödvändiga eftersom videoströmmen används i flera funktioner.
let videoStream = null;
let facing = 'user';
let recorder = null
let chunks = null

function startRecording() {
	if( !videoStream )
		return;
	
	recorder = new MediaRecorder(videoStream)
	chunks = []

	recorder.addEventListener('dataavailable', event => {
		if( event.data.size > 0 ) {
			chunks.push(event.data)  // varje chunk är en Blob
		}
	})

	recorder.addEventListener('stop', () => {
		const masterBlob = new Blob(chunks, { type: 'video/webm' })
		const url = URL.createObjectURL(masterBlob)
	
		const a = document.createElement('a')
		a.innerHTML = 'Click to download recording.'
		a.href = url
		a.download = 'awesome-movie.webm'
		downloadPara.appendChild(a)
	
		// Om vi vill ta bort länken efter att man har klickat på den:
		/* a.addEventListener('click', () => {
			downloadPara.innerHTML = ''
		}) */
	})

	recorder.start()
}

function stopRecording() {
	recorder.stop()
}

function changeFacing() {
	if( facing === 'user' ) {
		facing = 'environment'
	} else {
		facing = 'user'
	}
}

function turnCameraOff() {
	// Om det inte finns någon videoström, finns det inget att stänga av; dvs. vi är redan klara.
	if( !videoStream )
		return;

	// Hämta alla spår från kameraströmmen och avsluta dem var och en
	let tracks = videoStream.getTracks()
	tracks.forEach(track => track.stop())

	// Uppdatera gränssnittet, så att buttons återspeglar vad användaren faktiskt kan göra.
	turnOffCameraButton.disabled = true
	turnOnCameraButton.disabled = false
	takePictureButton.disabled = true
}

async function turnCameraOn() {
	// Ange önskade dimensioner på videoströmmen. När vi tar stillbilder kommer samma dimensioner användas.
	const constraints = {
		video: { width: 320, height: 240, facingMode: facing },
		audio: false   // ändra till TRUE om du vill aktivera mikrofon
	}
	const md = navigator.mediaDevices
	// console.log('About to ask for video');
	try {
		// getUserMedia kan kasta ett Error, om användaren inte tillåter att vi använder kamera
		videoStream = await md.getUserMedia(constraints)
		// console.log('We got a stream object', videoStream);

		// Nu har vi fått tillgång till kamerans dataström
		turnOffCameraButton.disabled = false
		turnOnCameraButton.disabled = true
		
		videoElement.srcObject = videoStream
		videoElement.addEventListener('loadedmetadata', () => {
			// Detta event körs när tillräckligt mycket av strömmen har laddats. Buffring innebär att ladda ner bitar av en videofil, i stället för allt på en gång. Då kan man börja visa video direkt när första biten kommer.
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