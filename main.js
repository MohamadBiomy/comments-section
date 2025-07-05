// DOM elements 
const container = document.querySelector(".container.comments-container")
const textarea = document.querySelector(".send-element textarea")
const sendButton = document.querySelector(".send-element button")
const overlay = document.querySelector(".overlay")
const popups = document.querySelectorAll(".popup")

// Variables
const currentUser = {
  score: 0,
  user: {}
}



overlay.remove()
popups.forEach(pop => pop.remove())


if (localStorage.getItem("comments")) {
  container.innerHTML = localStorage.getItem("comments")
  currentUser.user = JSON.parse(localStorage.getItem("currentUser"))

  container.querySelectorAll(".score i:first-child").forEach(i => i.addEventListener("click", increaseScore))
  container.querySelectorAll(".score i:last-child").forEach(i => i.addEventListener("click", decreaseScore))
  container.querySelectorAll(".control .del").forEach(b => b.addEventListener("click", deleteComment))
  container.querySelectorAll(".control .reply").forEach(b => b.addEventListener("click", addReplySection))
  container.querySelectorAll(".control .edit").forEach(b => b.addEventListener("click", changeParaToTextarea))

  // Restart time updates for all comments
  restartTimeUpdates()

} else {
  // Fetching data
  fetch("data.json").then(res => res.json())
  .then(data => {
    const userName = data.currentUser.username
    currentUser.user = data.currentUser
    data.comments.forEach(comment => {
      let isSelf = false
      if (userName === comment.user.userName) isSelf = true
      // Convert string timestamps to actual timestamps for existing data
      if (typeof comment.createdAt === 'string') {
        comment.createdAt = convertStringToTimestamp(comment.createdAt)
      }
      // Convert timestamps for replies
      if (comment.replies && comment.replies.length > 0) {
        comment.replies.forEach(reply => {
          if (typeof reply.createdAt === 'string') {
            reply.createdAt = convertStringToTimestamp(reply.createdAt)
          }
        })
      }
      createComment(container, comment, userName, isSelf)
    });

    setLocalStorage()
    
    // Start time updates for initial comments
    restartTimeUpdates()
  })
}

// Sending comment
sendButton.addEventListener("click", () => {
  if (textarea.value) {
    const initialComment = {
      ...currentUser,
      content: textarea.value,
      createdAt: Date.now() // Set timestamp when comment is created
    }

    popup("send").then(res => {
      if (res) {
        createComment(container, initialComment, initialComment.user.username, true, true)
        textarea.value = ""
        setLocalStorage()
      }
    })

  }

})




/* ---------- FUNCTIONS ---------- */

function createComment(parent, dataObj, selfName, isSelf = false, isCreatedByUser = false) {

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
        // Set initial time display
        timeAgo.textContent = getTimeAgo(dataObj.createdAt)
        // Store timestamp as data attribute for later retrieval
        timeAgo.setAttribute('data-timestamp', dataObj.createdAt)
        // updating time
        if (isCreatedByUser) timeUpdate(timeAgo, dataObj.createdAt)
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
        reply.addEventListener("click", addReplySection)
        reply.className = "reply"
        const edit = document.createElement("div")
        edit.addEventListener("click", changeParaToTextarea)
        edit.className = "edit"
        const del = document.createElement("div")
        del.addEventListener("click", deleteComment)
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

  setLocalStorage()
}


function addReplySection() {
  const comment = this.parentElement.parentElement.parentElement.parentElement
  const commentContainer = comment.parentElement

  // check if send element is already exits
  if (commentContainer.querySelector(".send-element")) {
    return
  }

  // creating reply element from clone of send element
  const replyElement = sendButton.parentElement.cloneNode(true)
  replyElement.querySelector("textarea").setAttribute("placeholder", "Reply to the comment...")
  replyElement.classList.remove("container")
  replyElement.classList.add("inner-comment")
  replyElement.querySelector("button").innerHTML = "REPLY"
  replyElement.querySelector("button").addEventListener("click", replyComment)
  
  commentContainer.insertBefore(replyElement, commentContainer.querySelector(".nested-comments"))

  replyElement.querySelector("textarea").focus()
}
function replyComment() {
  
  // check if textarea has content
  if (!this.previousSibling.previousSibling.value) return


  // append new comment to the nested comments
  const content = this.previousSibling.previousSibling.value
  const initialComment = {
    ...currentUser,
    content: content,
    createdAt: Date.now() // Set timestamp when reply is created
  }

  const nestedCommentsContainer = this.parentElement.parentElement.querySelector(".nested-comments")


  popup("send").then(res => {
    if (res) {
      createComment(nestedCommentsContainer, initialComment, initialComment.user.username, true, true)

      // remove send element 
      this.parentElement.remove()

      setLocalStorage()
    }
  })
}


function changeParaToTextarea() {
  
  const infoDiv = this.parentElement.parentElement.parentElement
  // disabling click if p is not exited
  if (!infoDiv.querySelector("& > p")) return

  const para = infoDiv.querySelector("& > p")
  const content = para.innerText

  para.remove()

  // append a textarea
  const textarea = document.createElement("textarea")
  textarea.value = content
  infoDiv.append(textarea)

  // append update button
  const button = document.createElement("button")
  button.innerHTML = "UPDATE"
  infoDiv.append(button)
  button.addEventListener("click", updateComment)
}
function updateComment() {
  const infoDiv = this.parentElement
  const textarea = this.previousSibling
  const content = textarea.value
  const para = document.createElement("p")


  popup("edit").then(res => {
    if (res) {
      textarea.remove()
      this.remove()
    
      para.innerHTML = content
      infoDiv.append(para)

      setLocalStorage()
    }
  })
}


function deleteComment() {
  const commentContainer = this.parentElement.parentElement.parentElement.parentElement.parentElement

  popup("delete")
  .then(res => {
    if (res) {
      commentContainer.remove()
      setLocalStorage()
    }
  })
}


function popup(type) {
  return new Promise((resolve) => {
    let popup;

    switch (type) {
      case "delete":
        popup = popups[0]
        break;
      case "edit": 
        popup = popups[1]
        break;
      case "send": 
        popup = popups[2]
        break;
    }

    document.body.append(overlay, popup)

    popup.querySelector("button:first-child").addEventListener("click", () => {
      overlay.remove()
      popup.remove()
      resolve(false)
    })
    
    popup.querySelector("button:last-child").addEventListener("click", () => {
      overlay.remove()
      popup.remove()
      resolve(true)
    })
  })


  // // Example usage:
  // popup("delete").then(result => {
  //   if (result) {
  //     console.log("User confirmed")
  //     // Proceed with delete action
  //   } else {
  //     console.log("User cancelled")
  //     // Cancel the action
  //   }
  // })
  
  // console.log(popup("delete"))
}


function setLocalStorage() {
  localStorage.setItem("comments", container.innerHTML)
  localStorage.setItem("currentUser", JSON.stringify(currentUser.user))
}

// Handle page close event
window.addEventListener('beforeunload', function(e) {
  // Save data before page closes
  setLocalStorage()
  
  // Optional: Show confirmation dialog (modern browsers may ignore this)
  // e.preventDefault()
  // e.returnValue = 'Are you sure you want to leave? Your changes may not be saved.'
})


function getTimeAgo(timestamp) {
  const now = Date.now()
  const timeDiff = Math.floor((now - timestamp) / 1000) // Convert to seconds
  
  if (timeDiff < 60) {
    return `${timeDiff} seconds ago`
  } else if (timeDiff >= 60 && timeDiff < 3600) {
    const minutes = Math.floor(timeDiff / 60)
    return `${minutes} minutes ago`
  } else if (timeDiff >= 3600 && timeDiff < 86400) {
    const hours = Math.floor(timeDiff / 3600)
    return `${hours} hours ago`
  } else if (timeDiff >= 86400 && timeDiff < 2592000) {
    const days = Math.floor(timeDiff / 86400)
    return `${days} days ago`
  } else if (timeDiff >= 2592000 && timeDiff < 31536000) {
    const months = Math.floor(timeDiff / 2592000)
    return `${months} months ago`
  } else {
    const years = Math.floor(timeDiff / 31536000)
    return `${years} years ago`
  }
}

function timeUpdate(timeElement, timestamp) {
  setInterval(() => {
    timeElement.textContent = getTimeAgo(timestamp)
  }, 5000)
}

function convertStringToTimestamp(timeString) {
  const now = Date.now()
  const lowerTimeString = timeString.toLowerCase()
  
  if (lowerTimeString.includes('second')) {
    const seconds = parseInt(lowerTimeString.match(/\d+/)[0])
    return now - (seconds * 1000)
  } else if (lowerTimeString.includes('minute')) {
    const minutes = parseInt(lowerTimeString.match(/\d+/)[0])
    return now - (minutes * 60 * 1000)
  } else if (lowerTimeString.includes('hour')) {
    const hours = parseInt(lowerTimeString.match(/\d+/)[0])
    return now - (hours * 60 * 60 * 1000)
  } else if (lowerTimeString.includes('day')) {
    const days = parseInt(lowerTimeString.match(/\d+/)[0])
    return now - (days * 24 * 60 * 60 * 1000)
  } else if (lowerTimeString.includes('week')) {
    const weeks = parseInt(lowerTimeString.match(/\d+/)[0])
    return now - (weeks * 7 * 24 * 60 * 60 * 1000)
  } else if (lowerTimeString.includes('month')) {
    const months = parseInt(lowerTimeString.match(/\d+/)[0])
    return now - (months * 30 * 24 * 60 * 60 * 1000)
  } else if (lowerTimeString.includes('year')) {
    const years = parseInt(lowerTimeString.match(/\d+/)[0])
    return now - (years * 365 * 24 * 60 * 60 * 1000)
  }
  
  // Default to current time if parsing fails
  return now
}

function restartTimeUpdates() {
  // Find all time elements and restart their updates
  const timeElements = container.querySelectorAll('.title span')
  
  timeElements.forEach(timeElement => {
    // Check if this span contains time text (like "5 minutes ago")
    const text = timeElement.textContent
    if (text && (text.includes('ago') || text.includes('second') || text.includes('minute') || text.includes('hour') || text.includes('day') || text.includes('month') || text.includes('year'))) {
      const timestamp = timeElement.getAttribute('data-timestamp')
      
      if (timestamp) {
        // Update the display immediately
        timeElement.textContent = getTimeAgo(parseInt(timestamp))
        // Start the interval for live updates
        timeUpdate(timeElement, parseInt(timestamp))
      }
    }
  })
}