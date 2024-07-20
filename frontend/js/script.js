// login elements
const login = document.querySelector(".login")
const loginForm = login.querySelector(".login__form")
const loginInput = login.querySelector(".login__input")

// chat elements
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = chat.querySelector(".chat__input")
const chatMessages = chat.querySelector(".chat__messages")

const colors = [
    "cadetblue",
    "darkgoldenrod",
    "cornflowerblue",
    "darkkhaki",
    "hotpink",
    "gold"
]

const user = { id: "", name: "", color: "" }

let websocket

const createMessageSelfElement = (content) => {
    const div = document.createElement("div")

    div.classList.add("message--self")
    div.innerHTML = content

    return div
}

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div")
    const span = document.createElement("span")

    div.classList.add("message--other")

    span.classList.add("message--sender")
    span.style.color = senderColor

    div.appendChild(span)

    span.innerHTML = sender
    div.innerHTML += content

    return div
}

const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({data}) => {
    const {userId, userName, userColor, content, type} = JSON.parse(data)

    let message;
    if (type === "notification") {
        message = createNotificationElement(content)
    } else {
        message = userId == user.id ? createMessageSelfElement(content) : createMessageOtherElement(content, userName, userColor)
    }
    chatMessages.appendChild(message)

    scrollScreen()
}

const createNotificationElement = (content) => {
    const div = document.createElement("div");
    div.classList.add("newlogin");
    
    const h4 = document.createElement("h4");
    h4.textContent = content;
    
    div.appendChild(h4);
    return div;
}

const notifyNewUser = () => {
    const message = {
        type: "notification",
        content: `${user.name} entrou no chat`
    }

    websocket.send(JSON.stringify(message))
}

const handleLogin = (event) => {
    event.preventDefault()

    user.id = crypto.randomUUID()
    user.name = loginInput.value
    user.color = getRandomColor()

    login.style.display = "none"
    chat.style.display = "flex"

    websocket = new WebSocket("wss://webchat-backend-888k.onrender.com")
    websocket.onmessage = processMessage;

    websocket.onopen = () => {
        notifyNewUser();
    }
}


const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        type: "message",
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    }

    websocket.send(JSON.stringify(message))

    chatInput.value = ""
}

loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)
