// --- CONFIGURATION ---
// WARNING: This is a public key. Replace it with your private key in a real application.
const IMGBB_API_KEY = "5f1df84c72e6ed2483b54305f83c7440"; 
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";
const TRANSFORM_API_ENDPOINT = "https://cryyy.itz-ashlynn.workers.dev/img2img";

// --- FIX APPLIED HERE ---
const PROXY_URL = "https://corsproxy.io/?"; // Changed from "https://api.allorigins.win/raw?url="

// --- DOM Elements ---
const imageFile = document.getElementById('imageFile');
const inputPreview = document.getElementById('inputPreview');
const outputImage = document.getElementById('outputImage');
const outputImageContainer = document.getElementById('outputImageContainer');
const downloadBtn = document.getElementById('downloadBtn');

// --- Global variable to store the transformed image Blob for download ---
let transformedImageBlob = null;

// --- Utility Functions ---
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Event listener for file selection to show preview
 */
imageFile.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            inputPreview.src = e.target.result;
            inputPreview.alt = "Selected image";
        };
        reader.readAsDataURL(file);
    } else {
         inputPreview.src = "https://placehold.co/400x400/3B82F6/FFFFFF?text=Select+Image+File";
    }
});

/**
 * Displays a message on the screen.
 */
function showMessage(text, classes) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = text;
    messageElement.className = `text-sm p-3 rounded-lg text-center mt-4 transition-all duration-300 ${classes}`;
    messageElement.classList.remove('hidden');
}

/**
 * Uploads the image file to ImgBB.
 * @param {File} file - The file to upload.
 * @returns {Promise<string>} The public URL of the uploaded image.
 */
async function uploadImageToImgBB(file) {
    showMessage("1/2: Uploading image to ImgBB...", 'bg-blue-100 text-blue-800');

    const formData = new FormData();
    formData.append("image", file); 

    const uploadUrlWithKey = `${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`;

    try {
        const response = await fetch(uploadUrlWithKey, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error(`ImgBB Upload failed: ${data.error.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error("ImgBB Upload Error:", error);
        throw new Error(`ImgBB Upload failed: ${error.message}. Please check your network or ImgBB key.`);
    }
}

/**
 * Fetches data with exponential backoff and proxy.
 */
async function fetchWithRetry(url, useProxy = true) {
    const finalUrl = useProxy ? `${PROXY_URL}${encodeURIComponent(url)}` : url;
    const MAX_RETRIES = 3;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await fetch(finalUrl);
            
            if (!response.ok) {
                throw new Error(`API returned status ${response.status} ${response.statusText}`);
            }
            return response;
        } catch (error) {
            if (i < MAX_RETRIES - 1) {
                const backoffTime = Math.pow(2, i) * 1000;
                await delay(backoffTime);
            } else {
                throw new Error(`Transformation API call failed (Max retries reached). ${error.message}`);
            }
        }
    }
}

/**
 * Downloads the transformed image.
 */
function downloadTransformedImage() {
    if (transformedImageBlob) {
        const url = URL.createObjectURL(transformedImageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ai_transformed_image_HS_Modz.png'; // Added brand name to download file
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Clean up
    } else {
        showMessage("No image available to download.", 'bg-red-100 text-red-800');
    }
}


/**
 * Starts the image transformation process.
 */
async function processImage() {
    const promptInput = document.getElementById('promptInput');
    const processBtn = document.getElementById('processBtn');
    const buttonText = document.getElementById('buttonText');
    const buttonIcon = document.getElementById('buttonIcon');
    const outputImage = document.getElementById('outputImage');
    
    // Hide download button and icon at the start of new process
    downloadBtn.classList.add('hidden');
    outputImageContainer.classList.remove('loaded');
    transformedImageBlob = null; // Clear previous blob

    // Reset error handler for the new attempt
    // Ab yeh error sirf processing ke dauraan hi trigger hoga
    outputImage.onerror = function() {
         outputImage.src='https://placehold.co/400x400/DC2626/FFFFFF?text=Image+Load+Failed';
         outputImage.alt='Image load failed due to invalid data or network issue'; 
         showMessage('Error: Generated data was not a valid image. Check console for details.', 'bg-red-100 text-red-800');
         outputImageContainer.classList.remove('loaded'); // Hide icon if error
    };

    const file = imageFile.files[0];
    const prompt = promptInput.value.trim();

    if (!file) {
        showMessage("Please select an image file first.", 'bg-yellow-100 text-yellow-800');
        return;
    }
    if (!prompt) {
        showMessage("Please enter a transformation prompt.", 'bg-yellow-100 text-yellow-800');
        return;
    }

    // --- UI State Start ---
    processBtn.disabled = true;
    buttonText.textContent = "Processing...";
    buttonIcon.classList.add('animate-spin');
    outputImage.src = "https://placehold.co/400x400/E5E7EB/6B7280?text=Processing..."; 
    
    let publicImageUrl = '';

    try {
        // STEP 1: Upload the file to ImgBB to get a public URL
        publicImageUrl = await uploadImageToImgBB(file);
        
        showMessage("1/2: Upload successful. 2/2: Starting AI transformation...", 'bg-indigo-100 text-indigo-800');
        
        // STEP 2: Use the public URL in the transformation API with Proxy
        const targetApiUrl = `${TRANSFORM_API_ENDPOINT}?prompt=${encodeURIComponent(prompt)}&imageUrl=${encodeURIComponent(publicImageUrl)}`;
        
        const response = await fetchWithRetry(targetApiUrl, true);

        // Get the raw image blob
        const imageBlob = await response.blob();
        
        if (imageBlob.size === 0) {
            throw new Error("Received empty response (0 bytes). The AI API or proxy may have failed.");
        }

        transformedImageBlob = imageBlob; // Store blob for download

        // Create and display the final image
        const objectURL = URL.createObjectURL(imageBlob);
        outputImage.src = objectURL;
        outputImage.alt = "AI transformed image";
        
        // Check if the image successfully loaded after a small delay
        outputImage.onload = function() {
            showMessage("Image transformation completed successfully!", 'bg-green-100 text-green-800');
            downloadBtn.classList.remove('hidden'); // Show download button
            outputImageContainer.classList.add('loaded'); // Show download icon
            URL.revokeObjectURL(objectURL); // Clean up the temporary URL
        };
        
    } catch (error) {
        console.error("Full process error:", error);
        showMessage(`Transformation failed: ${error.message}`, 'bg-red-100 text-red-800');
    } finally {
        // --- UI State End ---
        processBtn.disabled = false;
        buttonText.textContent = "Upload & Generate Transformation";
        buttonIcon.classList.remove('animate-spin');
    }
}

  
// Set initial message on page load
window.onload = function() {
    showMessage("Select your image and enter a prompt to start the 2-step process: Upload then Transform.", 'bg-gray-100 text-gray-700');
};