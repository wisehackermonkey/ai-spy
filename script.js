// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/HkHE3HZcd/";

let model, webcam, labelContainer, maxPredictions;

// global list of current items the user has to find
// example of one item {name:"book",show:true}
const current_items = [
  {name:"face",show:true},
  {name:"book",show:true},
  {name:"shoe",show:true},
  ]

let sound_fx_collect_item = new Audio('tada_1.mp3');

// cross off found items 
let cross_off_item = (item_name) => {
  let index = current_items.findIndex(e => e.name ===item_name)
  
  // check if the code found a item in the current_items array of objects
  let sucess = false;

  current_items.forEach(e => {
      if(e.name === item_name && e.show === true){
        
        current_items[index].show = false;
        console.log(`Crossed Off ${item_name}, Name= ${e.name}`)
        // actually cross of the element in the list
        let el = document.getElementById(e.name)
        el.style.textDecoration = "line-through"
        sucess = true;
      }else{
          console.log(`Didnt cross Off  ${item_name}`)
        
      }
  })
  return sucess;
}

// Load the image model and setup the webcam
async function init() {
    
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // load the model and metadata
    // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
    // or files from your local hard drive
    // Note: the pose library adds "tmImage" object to your window (window.tmImage)
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(300, 300, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) { // and class labels
        labelContainer.appendChild(document.createElement("div"));
    }

          // run the main part of the code



}
async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            "You found a " + prediction[i].className + "!";
        
        const item_name_found = prediction[i].className

        if (prediction[i].probability.toFixed(2)>0.97){
            labelContainer.childNodes[i].innerHTML = classPrediction;

            // this code crosses off all items that the user is displaying
            if(cross_off_item(item_name_found)){
                sound_fx_collect_item.play();
                party.confetti(document.getElementById(item_name_found));

            }

        } else {
          labelContainer.childNodes[i].innerHTML = "";
        };

    }
}


