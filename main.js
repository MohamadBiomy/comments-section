// DOM elements 
const container = document.querySelector(".container.comments-container")
const textarea = document.querySelector(".send-element textarea")
const sendButton = document.querySelector(".send-element button")

// Variables
let currentUser = {}


// Fetching data
fetch("data.json").then(res => res.json())
.then(data => {
  const userName = data.currentUser.username
  currentUser = data.currentUser
  data.comments.forEach(comment => {
    let isSelf = false
    if (userName === comment.user.userName) isSelf = true
    createComment(container, comment, userName, isSelf)
  });
})


// Sending comment
sendButton.addEventListener("click", () => {
  if (textarea.value) {
    const initialComment = {
      score: 0,
      content: textarea.value,
      createdAt: "Now",
      user: currentUser
    }

    createComment(container, initialComment, initialComment.user.username, true)
  }

  textarea.value = ""
})

/* ---------- FUNCTIONS ---------- */

function createComment(parent, dataObj, selfName, isSelf = false) {

  // comment container
  const commentContainer = document.createElement("div")
  commentContainer.className = "comment-container"
  parent.append(commentContainer)

  // comment
  const comment = document.createElement("div")
  comment.classList.add("comment")
  isSelf ? comment.classList.add("self-comment") : ""
  commentContainer.append(comment)

  // score
  const score = document.createElement("div")
  score.className = "score"
  comment.append(score)
    // score content
    const plus = document.createElement("i")
    const minus = document.createElement("i")
    plus.className = "fa-solid fa-plus"
    plus.addEventListener("click", increaseScore)
    minus.className = "fa-solid fa-minus"
    minus.addEventListener("click", decreaseScore)
    const scoreNum = document.createElement("span")
    scoreNum.textContent = dataObj.score
    score.append(plus, scoreNum, minus)

  // info
  const infoDiv = document.createElement("div")
  infoDiv.className = "info"
  comment.append(infoDiv)
    // holder div
    const holderDiv = document.createElement("div")
    infoDiv.append(holderDiv)
      // title
      const title = document.createElement("div")
      title.className = "title"
      holderDiv.append(title)
        // title content
        const avatar = document.createElement("img")
        const userName = document.createElement("p")
        const timeAgo = document.createElement("span")
        avatar.src = dataObj.user.image.png
        userName.textContent = dataObj.user.username
        timeAgo.textContent = dataObj.createdAt
        title.append(avatar, userName)
        const you = document.createElement("span")
        you.textContent = "you"
        isSelf ? title.append(you) : ""
        title.append(timeAgo)
      // control
      const control = document.createElement("control")
      control.className = "control"
      holderDiv.append(control)
        // control content
        const reply = document.createElement("div")
        const edit = document.createElement("div")
        const del = document.createElement("div")
        del.className = "del"
        reply.innerHTML = `<i class="fa-solid fa-reply"></i> Reply`
        edit.innerHTML = `<i class="fa-solid fa-pen"></i> Edit`
        del.innerHTML = `<i class="fa-solid fa-trash"></i> Delete`
        if (isSelf) {
          control.append(del, edit)
        } else control.append(reply)
    // content
    const content = document.createElement("p")
    content.textContent = dataObj.content
    infoDiv.append(content)
  
  // nested comment
  const nestedComments = document.createElement("div")
  nestedComments.className = "nested-comments"
  commentContainer.append(nestedComments)

  if (dataObj.replies) {
    const replies = dataObj.replies
    if (replies.length > 0) {
      for (let i = 0; i < replies.length; i++) {
        let isSelf = false
        if (replies[i].user.username === selfName) isSelf = true
        createComment(nestedComments, replies[i], userName, isSelf)
      }
    }
  }

}


function increaseScore() {
  if (this.parentElement.classList.contains("decreased")) {
    this.parentElement.classList.remove("decreased")
  } else {
    this.parentElement.classList.add("increased")
  }
  this.nextSibling.innerHTML++

  arrangeComment(this.parentElement.parentElement.parentElement, this.nextSibling.innerHTML)
}
function decreaseScore() {
  if (this.parentElement.classList.contains("increased")) {
    this.parentElement.classList.remove("increased")
  } else {
    this.parentElement.classList.add("decreased")
  }
  this.previousSibling.innerHTML--

  arrangeComment(this.parentElement.parentElement.parentElement, this.previousSibling.innerHTML)
}


function arrangeComment(comment, score) {
  const nextSibling = comment.nextSibling
  const previousSibling = comment.previousSibling
  let nextSiblingScore = +score - 1
  let previousSiblingScore = +score + 1

  if (nextSibling) nextSiblingScore = nextSibling.querySelector(".score span").textContent
  if (previousSibling) previousSiblingScore = previousSibling.querySelector(".score span").textContent

  if (score < nextSiblingScore) {
    const parentElement = comment.parentElement
    const insertBeforeElement = nextSibling.nextSibling

    comment.remove()
    
    parentElement.insertBefore(comment, insertBeforeElement)

    arrangeComment(comment, score)
  } else if (score > previousSiblingScore) {
    const parentElement = comment.parentElement
    const insertBeforeElement = previousSibling.previousSibling

    comment.remove()
    
    if (!insertBeforeElement) {
      parentElement.prepend(comment)
    } else {
      parentElement.insertBefore(comment, insertBeforeElement)
    }

    arrangeComment(comment, score)
  } 
}

