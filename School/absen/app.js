document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const locationSpan = document.getElementById('location');

    // Meminta izin lokasi
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            locationSpan.textContent = `Lat: ${latitude}, Long: ${longitude}`;
        }, error => {
            locationSpan.textContent = 'Lokasi tidak ditemukan';
        });
    } else {
        locationSpan.textContent = 'Geolocation tidak didukung oleh browser ini';
    }

    // Memuat model face-api.js
    Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
    ]).then(startVideo);

    function startVideo() {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                video.srcObject = stream;
                video.play();
            })
            .catch(err => {
                console.error('Error accessing webcam: ', err);
                alert('Tidak dapat mengakses webcam. Pastikan izin telah diberikan.');
            });
    }

    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }, 100);
    });

    // Submit event untuk form
    document.getElementById('attendanceForm').addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Absensi berhasil dicatat');
    });
});
