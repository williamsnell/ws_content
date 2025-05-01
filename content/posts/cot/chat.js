function makeChat(id, chat_list) {
    elem = document.getElementById(id);
    elem.classList.add("chat-container");

    for (let i = 0; i < chat_list.length; i++) {
        let wrapper = document.createElement("div");
        wrapper.classList.add("wrapper");

        let bubble = document.createElement("div"); 
        bubble.innerHTML = chat_list[i];
        bubble.classList.add("chat");
        bubble.classList.add((i % 2 == 0) ? "right" : "left");
        
        if (i % 2 != 0) {
            let robot = document.createElement("img");
            robot.src = "robot.svg";
            robot.classList.add("user-icon");

            wrapper.appendChild(robot);
        }

        wrapper.appendChild(bubble);
        elem.appendChild(wrapper);
    }
}
