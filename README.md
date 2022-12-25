# Async Tic Tac Toe
<br>
Async Tic Tac Toe is a Tic Tac Toe game developed as a mobile application. Tic-tac-toe, noughts and crosses, or Xs and Os  is a paper-and-pencil game for two players who take turns marking the spaces in a three-by-three grid with X or O. The player who succeeds in placing three of their marks in a horizontal, vertical, or diagonal row is the winner. It is a solved game, with a forced draw assuming best play from both players.<br /> <br />
View the deployment at:
<a href="https://tic-tac-toe-livid-tau.vercel.app/">Vercel</a>

## How to run development server

```bash
git clone --recursive https://github.com/Gourav1100/TicTacToe.git
cd tictactoe
npm install
cd backend && npm install && cd ..
npm start & disown
cd backend
node app.js & disown
node socket.js & disown
```
now search for localhost:3000 in browser to use.

## Screenshots

## Features
This game supports - 
- **Backend**
    - Developed a server capable to load API during runtime. This allows to rewrite into the API and then no need to reload the server as API are contained within modules and imported at run time.
    - A socket server to play the game in real time. Server has support for managing user status (online or offline) and handle game accordingly. If one of the users is not present that it simply updates the state and stores it into the database. Otherwise updates are reflected on both the ends as well as stored onto the database.
    - Token based validation to validate the request and grant access.
    - Asyncronous API to handle multiple requests.

- **User management**
    - Users can log in / register using basic info.
    - Email id & username are unique per user.
    - Once logged in, user stays logged in until cache is cleared from the browser.
- **Starting an asynchronous game with anyone via their emai id**
    - I can only have one ongoing game with any other user.
    - Until that game is finished, I can’t start another game with the same user.
    - I can start a game with anyone using their email id.
    - As soon as the game is created, the intiator gets the first move & other user’s home page reflects the game.
    - Every player sees `X` as their piece & `O` as the other player’s piece in every game.
- **Gameplay**
    - Should support standard 3x3 Tic Tac Toe game.
    - First player to put their piece in 3 consecutive squares wins the game.
    - Game can be drawn too.
    - These are the possible game states at any point in the game.
        - Won.
        - Drawn.
        - Waiting for other player to play.
        - Waiting for you to play.
- **Home page**
    - As soon as the games are started, a card is created for every game.
    - These cards are sorted in descending order of their last updated time
        - Update only happens when the state of the game changes i.e.
            - When either players play, or
            - Game finishes.

## Tech Stack
- React.JS
- Node.JS
- socket.io
- MongoDB
- Material UI
- express.js
- dotENV

## Problems faced during development
- First problem was with using hooks instead on class based implementation. This made me learn about new hooks and how to implement class equivalents using hooks.
- Developing the frontend as per the required design and centering elements in css.
- Designing a minimal database capable to perform all the required functions and, the implmenting it using nodejs and mongodb.
- Optimising frontend to remove unneccessary re-renders and repeated request to the backend servers.
- Backend Server was using API that we reloaded into the cache so dynamic update was not working. This was fixed by clearing the cache for that API everytime and hence unloading the API.
- Development a mechanism for socket server to validate requests and securly perform all operations. This was achieved by designing a request protocol to be followed by the frontend and tokens for validating requests.
- Only two API were developed that were capable to handling all the required operations. This was achieved by seperating functions on the basis of request type (GET, POST, ...).
- CORS were used to allow request from different origin.
