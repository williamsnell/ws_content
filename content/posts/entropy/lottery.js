let screen;
let button;

let machine = document.getElementById("machine");
let ticket = document.getElementById("ticket");

let lottery_choice = null;

let numbers = document.getElementById("ticket numbers");

function initialize_ticket() {
    lottery_choice = null;
    numbers.innerHTML = "";
    for (let i = 1; i < 21; i++) {
        let number = document.createElement("div");
        number.style = "width: 40px; height: 40px; margin-left: 10px; margin-top: 1px; font-family: Courier, Monospace; font-weight: bold; color: black; cursor: pointer;";
        number.textContent = i;
        number.addEventListener("click", function handleClick (){
            lottery_choice = i;
            numbers.innerHTML = "";
            for (let i = 1; i < 21; i++) {
                let number = document.createElement("div");
                number.style = "width: 40px; height: 40px; margin-left: 10px; margin-top: 1px; font-family: Courier, Monospace; font-weight: bold; color: black; cursor: pointer;";
                if (i == lottery_choice) { 
                    number.textContent = i;
                } else {
                    number.textContent = "";
                }
                numbers.appendChild(number);
            };
            // add a "play again?" button
            let play_again = document.createElement("div");
            play_again.style = "margin-left: 60px; margin-top: -8px; font-family: Courier, Monospace; font-weight: bold; color: black; border: 1px black; cursor: pointer;";
            play_again.textContent = "Reset?";
            play_again.addEventListener("click", initialize_ticket);
            numbers.appendChild(play_again);
            number.style.textContent = i;
        });
        numbers.appendChild(number)
    }
}


let text_buffer = "(-!PRESS!BUTTON!TO!PLAY!!";

let TIME_PER_CHARACTER = 300; // ms
let SCREEN_CAPACITY = 8; // characters
let start_character = 0;
let prev_time = 0;


function cycleDisplay(timestamp) {
    if (screen && (timestamp > prev_time + TIME_PER_CHARACTER)) {
        prev_time = timestamp;
        let text = "";
        for (let i = 0; i < SCREEN_CAPACITY; i++) {
            text += text_buffer.charAt((i + start_character) % text_buffer.length);
        }
        screen.textContent = text;
        start_character += 1;
    }

    requestAnimationFrame(cycleDisplay);
}

function time_to_display(message) {
    return message.length * TIME_PER_CHARACTER;
}

function show_message(message) {
    text_buffer = message;
    start_character = 0;
    return time_to_display(message);
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // The maximum is inclusive and the minimum is inclusive
}

function requestLotteryResult(){
    if (lottery_choice === null) {
        show_message("SELECT!A!NUMBER!ON!THE!TICKET!FIRST!");
    } else {
        if (getRandomIntInclusive(1, 20) != lottery_choice) {
            show_message("!!!!!!!0!!YOU!LOSE")
        } else {
            show_message("!!!!!!!1!!YOU!WIN")
        }
    }
}

window.addEventListener("load", () => {
    screen = machine.contentDocument.getElementById("screen-text");
    button = machine.contentDocument.getElementById("button");
    button.addEventListener("click", requestLotteryResult);
    initialize_ticket();
    requestAnimationFrame(cycleDisplay);
});


