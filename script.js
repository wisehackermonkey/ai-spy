// More API functions here:
// https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/HkHE3HZcd/";

let model, webcam, labelContainer, maxPredictions;

// global list of current items the user has to find
// example of one item {name:"book",show:true}
const current_items = [
  {name:"face",show:false},
  {name:"book",show:false},
  {name:"shoe",show:false},
  ]

// the sound effect for when the user correctly displays the items
let sound_fx_collect_item = new Audio('tada_1.mp3');
let sound_fx_clocksound = new Audio('clockticksound-01.mp3');
let sound_fx_fail_sound = new Audio('thepriceisright-loserhorns.mp3');
let win_sound_fx = new Audio("victory-mario-series-hq-super-smash-bros.mp3");
let face_sound_fx  = new Audio("face.wav");
let book_sound_fx  = new Audio("book.wav");
let shoe_sound_fx  = new Audio("shoe.wav");


// the timer for the game looks like `14 seconds left!` 
let start_time = 59;


// used to allow the win sound effect to only play once 
let game_is_won = false;

// cross off found items 
let cross_off_item = (item_name) => {
  let index = current_items.findIndex(e => e.name ===item_name)
  
  // check if the code found a item in the current_items array of objects
  let sucess = false;

  current_items.forEach(e => {
      if(e.name === item_name && e.show === false){
        
        current_items[index].show = true;
        console.log(`Crossed Off ${item_name}, Name= ${e.name}`)
        // actually cross of the element in the list
        let el = document.getElementById(e.name)
        el.style.textDecoration = "line-through"
        el.style.textDecorationThickness = ".2em"
        sucess = true;
      }else{
          // console.log(`Didnt cross Off  ${item_name}`)
        
      }
  })
  return sucess;
}
// turn off all the sound effects on the page by pressing the mute button
let mute_fx = ()=>{

sound_fx_collect_item.pause()
sound_fx_clocksound.pause()
sound_fx_fail_sound.pause()
win_sound_fx.pause()
face_sound_fx.pause()
book_sound_fx.pause()
shoe_sound_fx.pause()
}
// fingure out if the player has won by 
// checking if they have collected all items they need to find
let is_game_won = ()=>{
  let has_won = true
  // array.reduce(function(total, currentValue, currentIndex, arr), initialValue)
  // check to see if there are ANY false in current_items[X].show and if there is return 
  // false (not win) if they are all true return true (means win)
  // true && true = true (game has been won)
  // true && false =false (game has not been won)
  // false && false = false (game has not been won)

  // this logic is slightly conveluted, its saying if any of the items are false, 
  // then return the opposit
  return !current_items.some((item)=>{
    return  item.show === false
  })
}

// Load the image model and setup the webcam
async function init() {
    sound_fx_clocksound.loop = true
    sound_fx_clocksound.play()
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    document.getElementById("show-hide").style.visibility = "visible"
  
    document.getElementById("hide-blurb").innerHTML = "<br>";


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


    //run the game timer from here
    // this will count down to 0 from start_time which is currently 30 seconds
    let timer = setInterval(e => {

      start_time -=1
      let el = document.getElementById('timer')
      // This is a gross hack to fix the html issue where the timer removes the image of the timer!
      // im maunually adding it each time i write a new time value
      el.innerHTML = `<img class="img-fluid" src="/assets/timer.png" alt="timer icon" width="30" height="30"> Time Remaining 0:${start_time}`

      //  here is where we check if the user has collected all the items
      // and has won the game
      if(is_game_won() && game_is_won === false){
          game_is_won = true;
          // play a win noise
          win_sound_fx.play();
          // stop the anoying clock ticking noise  
          sound_fx_clocksound.pause();   
          console.log("game has been won!")
          //display a green color in background so the user knows they have one!
          document.getElementById("show-confetti").style.background = "green"
          //load the win state page to give the player a visual reward
          window.location.href = window.location.origin + '/win_game.html'

          let timer2 = 5
          let stop_confetti = setInterval(e => {
              //every 1 second show some confetti as a selbration 
              party.confetti(document.getElementById("btn"));
              party.confetti(document.getElementById("title"));
              party.confetti(document.getElementById("webcam-container"));
              party.confetti(document.getElementById("show-confetti"));
              
              // another gross hack to stop the timer 
              timer2-=1
              clearInterval(timer)
              if(timer2 <= 0){
              clearInterval(stop_confetti)
              sound_fx_clocksound.pause();   

              }
           }, 1000)

      }
      // if the user doesnt collect the items befor the timer runs out
      if(start_time <= 0 && game_is_won === false){
        sound_fx_fail_sound.play();
        sound_fx_clocksound.pause();   

        clearInterval(timer);
        
        document.getElementById("show-confetti").style.background = "red"
        
        alert("Try Again?");
        setTimeout(e=>{
            window.location.reload(true); 
        },1000)
      }
    }, 1000)


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
            "I spy a " + prediction[i].className + "!";
        
        const item_name_found = prediction[i].className

        if (prediction[i].probability.toFixed(2)>0.97){
            labelContainer.childNodes[i].innerHTML = classPrediction;

      

            // this code crosses off all items that the user is displaying
            if(cross_off_item(item_name_found)){
                sound_fx_collect_item.play();
                party.confetti(document.getElementById(item_name_found));
                if(item_name_found == "face"){
                  face_sound_fx.play();
                }

                 if(item_name_found == "book"){
                  book_sound_fx.play();
                }

                if(item_name_found == "shoe"){
                  shoe_sound_fx.play();
                }
            }

        } else {
          labelContainer.childNodes[i].innerHTML = "";
        };

    }
}


