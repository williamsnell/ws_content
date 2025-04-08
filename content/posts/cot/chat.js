function makeChat(id, chat_list) {
    elem = document.getElementById(id);
    elem.classList.add("chat-container");

    for (let i = 0; i < chat_list.length; i++) {
        bubble = document.createElement("div"); 
        bubble.innerHTML = chat_list[i];
        bubble.classList.add("chat");
        bubble.classList.add((i % 2 == 0) ? "right" : "left");
        
        elem.appendChild(bubble);
    }
}
