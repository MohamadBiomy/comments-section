build and initial comment with nested comments on all screens
- comment structure #DONE#
  -- comment container
   comment 
    content
   send element
   nested comments
- create createComment fun #DONE#
paras = (parent to add in so if its nested the parent will be nestedContainer, comment obj, if self comment)
- fetch data #DONE#
- if comments has replies #DONE#
nested section has right padding and margin = 30px
inner comments is normal comments
- add send comments element #DONE#
these comments will be appended to the container
- score updating 
check for score element if it has data-increased or decreased dont do changes 
after changing scores check for the next and previous siblings if the score bigger or smaller
  remove the comment then append it
changing scores should be done with recursion so if there are comments with equal scores, append the comment after them all
- sending new comments
after clicking send button, remove text area value, then add a comment with createSelfComment fun
- edit button 
when click it change the p content to text area and append update button to the comment and prevent 
events on edit button
- delete button 
when clicking it remove the comment
- confirmation message
- reply button 
when clicking it append new element like send element to nested comments container 
after clicking reply button change send element to be comment
- text area resize
find how to make text area change it height depending on user inputs
- local storage
- all screen widths
- use time stamp for self comments