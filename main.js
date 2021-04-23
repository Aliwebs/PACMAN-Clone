//* MVP
// grey comments are guesses on how I could go about it
const elements = {
  grid: document.querySelector('#game-window'),
  displayScore: document.querySelector('#score'),
  mainMenu: document.querySelector('#main-menu'),
  playBtn: document.querySelectorAll('.playBtn'),
  settingsBtn: document.querySelector('#settingsBtn'),
  mainWindow: document.querySelector('main'),
  resultWindow: document.querySelector('#results'),
  displayResult: document.querySelector('#result'),
  settingsWindow: document.querySelector('#settings'),
  sfx: document.querySelector('#SFX'),
  music: document.querySelector('#MUSIC'),
  FPS: document.querySelector('#framerate'),
}

const gridArray = new Array()
const WIDTH = 25
const HEIGHT = (WIDTH + 3)
let SFX = true
let MUSIC = true
let mappedGridArray
let score = 0
let isPlaying = true
let activeGhosts = {
  add(ghostName) {
    if (this[ghostName] === undefined) {
      this[ghostName] = ghost(GHOSTS_PRESET[ghostName].x, GHOSTS_PRESET[ghostName].y, ghostName)
      return this[ghostName]
    }
  },
}
let frameIndex = 0
const FRAMEOPTIONS = [10, 20, 30, 40]
let FRAMERATE = FRAMEOPTIONS[frameIndex]

const GHOSTS_PRESET = {
  inky: {
    y: 13,
    x: 12,
  },
  blinky: {
    y: 12,
    x: 14,
  },
  clyde: {
    y: 13,
    x: 14,
  },
  pinky: {
    y: 14,
    x: 14,
  },
}



//listen for game start button and call playGame if it is clicked
elements.playBtn.forEach(button => {
  button.addEventListener('click', playGame)
})
//listen for settings button and show settings window on click
elements.settingsBtn.addEventListener('click', () => {
  elements.mainMenu.style.display = 'none'
  elements.settingsWindow.style.display = 'flex'
})
//listen to settings and change accordingly
elements.settingsWindow.addEventListener('click', (e) => {
  console.log(e.target.lastChild)
  if (e.target.localName === 'button' || e.target.localName === 'span') {
    if (e.target.lastChild.id === 'SFX' || e.target.id === 'SFX') {
      SFX = !SFX
      elements.sfx.innerHTML = SFX
    }
    if (e.target.lastChild.id === 'MUSIC' || e.target.id === 'MUSIC') {
      MUSIC = !MUSIC
      elements.music.innerHTML = MUSIC
    }
    if (e.target.id === 'exit') {
      elements.mainMenu.style.display = 'flex'
      elements.settingsWindow.style.display = 'none'
    }
    if (e.target.id === 'framerate' || e.target.lastChild.id === 'framerate') {
      elements.FPS.innerHTML = FRAMEOPTIONS[frameIndex]
      FRAMERATE = FRAMEOPTIONS[frameIndex]
      frameIndex++
    }
    if (frameIndex >= FRAMEOPTIONS.length) frameIndex = 0
  }
})

// set music/sfx value to true or false
// set frame rate
elements.sfx.innerHTML = SFX
elements.music.innerHTML = MUSIC
elements.FPS.innerHTML = FRAMEOPTIONS[frameIndex]


const pacman = {
  //here x and y are the current coordinates
  x: 13,
  y: 23,
  //current x and y speed
  speed: { x: 0, y: 0 },
  //current element where pacman is 
  current() {
    return mappedGridArray[this.y][this.x]
  },
  //next element where pacman is going
  target() {
    return mappedGridArray[this.y + (this.speed.y)][this.x + (this.speed.x)]
  },
  bigFood: false,
  //move function removes the span element from current and moves player by x and y speed 
  //then places player there
  move() {
    if (this.target() === undefined) return
    if (!this.target().classList.contains('wall')) {
      this.remove()
      this.x += (this.speed.x)
      this.y += (this.speed.y)
      this.spawn()
    }


    //https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/

    if (this.current().querySelector('.ghostBlink') !== null
      && this.current().querySelector('.pacman') !== null) {
      if (SFX) playSound('pacman_death')
      const ghostId = this.current().querySelector('.ghostBlink').getAttribute('id')
      delete activeGhosts[ghostId]
      score += 200
      this.current().querySelector('.ghostBlink').remove()
      setTimeout(() => {
        if (!activeGhosts[ghostId]) {
          activeGhosts.add(ghostId).spawn()
        }
      }, 1000)

    }


    //! player loses if pacman hits a ghost
    if (this.current().querySelector('.ghost') !== null
      && this.current().querySelector('.pacman')) {
      if (SFX) playSound('pacman_death')
      //set the mainWindow to display none and set the result window to display flex
      elements.mainWindow.style.display = 'none'
      elements.resultWindow.style.display = 'flex'
      //? If player looses stop game loop and display result
      elements.displayResult.innerHTML = `Your loose! score is: ${score}`
      for (let i = 1; i < 999; i++) {
        clearInterval(i)
      }
    }
  },
  eatFood() {
    //! pacman eats the food as it moves trough the maze
    if (this.current().querySelector('.food') !== null) {
      if (SFX) playSound('pacman_chomp.wav')
      this.current().querySelector('.food').remove('food')
      //increase score after eating food
      score += 10
      //display score
      elements.displayScore.innerHTML = score
      //if they pick up all food then they win
      //! player wins if pacman eats all the food in the level
      if (document.querySelectorAll('.food').length === 0
        && document.querySelectorAll('.bigFood').length === 0) {
        elements.mainWindow.style.display = 'none'
        elements.resultWindow.style.display = 'flex'
        //? if player wins display score (for mvp only one level)
        elements.displayResult.innerHTML = `You win! score is:   ${score}`
        for (let i = 1; i < 999; i++) {
          clearInterval(i)
        }
      }
    }
    if (this.current().querySelector('.bigFood') !== null) {
      score += 50
      this.current().querySelector('.bigFood').remove('bigFood')
      this.bigFood = true
      setTimeout(() => {
        this.bigFood = false
      }, 10000)
    }
  },
  spawn(y, x) {
    const pacmanSprite = document.createElement('div')
    const pacmanMouth = document.createElement('div')
    pacmanMouth.classList.add('pacman_mouth')
    pacmanSprite.appendChild(pacmanMouth)
    pacmanSprite.classList.add('pacman')
    if (y !== undefined && x !== undefined) {
      this.y = y
      this.x = x
      this.current().appendChild(pacmanSprite)
    } else {
      this.current().appendChild(pacmanSprite)
    }
    return pacmanSprite
  },
  remove() {
    if (this.current().querySelector('.pacman') !== null) {
      this.current().querySelector('.pacman').remove()
    }
  },
  teleport() {
    if (this.current() !== null) {
      if (this.current().classList.contains('portalLeft')) {
        this.remove()
        this.spawn(14, 24)
      }
      if (this.current().classList.contains('portalRight')) {
        this.remove()
        this.spawn(14, 2)
      }
    }
  },
}


function ghost(y, x, name) {
  return {
    x: x,
    y: y,
    speed: { x: 0, y: -1 },
    visited: [],
    //current element where ghost is 
    current() {
      return mappedGridArray[this.y][this.x]
    },
    //next element where ghost is going
    target() {
      return mappedGridArray[this.y + (this.speed.y)][this.x + (this.speed.x)]
    },
    move() {
      changeDirection(this)
      if (mappedGridArray[this.y][this.x].querySelector('.ghost') !== null) {
        //remove the ghost from current position
        this.remove()
        //moves ghost in that direction
        this.x += (this.speed.x)
        this.y += (this.speed.y)
        //add ghost on new position
        this.spawn()
      }
      if (pacman.bigFood) {
        const array = Object.entries(activeGhosts)
        for (let i = 1; i < array.length; i++) {
          array[i][1].blinking()
        }
      } else {
        this.stopBlinking()
      }
      //add position to visited
      this.visited.push(`${this.y}:${this.x}`)
    },
    spawn(y, x) {
      const ghostSprite = document.createElement('span')
      ghostSprite.classList.add('ghost')
      ghostSprite.setAttribute('id', name)
      ghostSprite.style.background = `url(./assets/${name}.svg)`
      if (y !== undefined && x !== undefined) {
        this.y = y
        this.x = x
        this.current().appendChild(ghostSprite)
      } else {
        this.current().appendChild(ghostSprite)
      }
      return this
    },
    remove() {
      mappedGridArray[this.y][this.x].querySelector('.ghost').remove()
    },
    blinking() {
      let ghost
      if (mappedGridArray[this.y][this.x].querySelector('.ghost') !== null) {
        ghost = mappedGridArray[this.y][this.x].querySelector('.ghost')
        ghost.classList.add('ghostBlink')
      }
    },
    stopBlinking() {
      let ghost
      if (mappedGridArray[this.y][this.x].querySelector('.ghost') !== null) {
        ghost = mappedGridArray[this.y][this.x].querySelector('.ghost')
        ghost.classList.remove('ghostBlink')
      }
    },
    teleport() {
      if (this.current() !== null) {
        if (this.current().classList.contains('portalLeft')) {
          this.remove()
          this.spawn(14, 24)
        }
        if (this.current().classList.contains('portalRight')) {
          this.remove()
          this.spawn(14, 2)
        }
      }
    },
  }
}

function playSound(url) {
  let audio = document.createElement('audio')
  audio.src = `./assets/${url}`
  audio.play()
}


function setup() {
  // refer to ./functions.js file
  mappedGridArray = createMap(HEIGHT, WIDTH)
  //? add blueprint onto grid, for MVP it will be a static board
  // from the map1 array gives the class wall to all walls
  map1.forEach((coordinate) => {
    mappedGridArray[coordinate[0]][coordinate[1]].classList.add('wall')
    mappedGridArray[coordinate[0]][coordinate[1]].type = 'wall'
  })
  // gives the class empty to all other boxes outside player path that are not walls
  map1Exclude.forEach(number => {
    gridArray[number - 1].classList.add('empty')
  })

  // const allWalls = mappedGridArray.map(column => {
  //   return column.filter((cell, index) => {
  //     if (cell.classList.contains('wall')
  //       && cell[index + 1].classList.contains('wall')) {

  //     }
  //   })
  // })

  //? place the food that pacman needs to collect
  //place food on all free path cells
  mappedGridArray.forEach(row => {
    row.forEach(cell => {
      if (!cell.classList.contains('wall') && cell.classList[0] !== 'empty') {
        const span = document.createElement('span')
        span.classList.add('food')
        cell.appendChild(span)
        cell.type = 'path'
        cell.classList.add('path')
      }
    })
  })

  const bigFoodCord = [[5, 2], [5, 24], [22, 2], [22, 24]]

  bigFoodCord.forEach(bigFood => {
    const elt = mappedGridArray[bigFood[0]][bigFood[1]].querySelector('.food')
    elt.classList.remove('food')
    elt.classList.add('bigFood')
  })

  //? set up teleport tunnels
  mappedGridArray[14][1].classList.add('portalLeft')
  mappedGridArray[14][25].classList.add('portalRight')
  //?take food away from holding pen
  mappedGridArray[13][13].children[0].classList.remove('food')
  mappedGridArray[14][12].children[0].classList.remove('food')
  mappedGridArray[15][12].children[0].classList.remove('food')
  mappedGridArray[14][13].children[0].classList.remove('food')
  mappedGridArray[15][13].children[0].classList.remove('food')
  mappedGridArray[14][14].children[0].classList.remove('food')
  mappedGridArray[15][14].children[0].classList.remove('food')
  mappedGridArray[23][13].children[0].classList.remove('food')


  //? play sound 
  if (MUSIC) playSound('pacman_beginning.wav')


  //? spawn pacman in predifined location without any movement
  //span pacman under the ghost spawn box 
  pacman.spawn()
  pacmanChangeDirectionOnInput()

  //? spawn 4 ghosts in spawn box
  activeGhosts.add('inky').spawn()
  activeGhosts.add('blinky').spawn()
  activeGhosts.add('clyde').spawn()
  activeGhosts.add('pinky').spawn()

}

function reset() {
  gridArray.forEach(elt => {
    elt.remove()
  })
  score = 0
  activeGhosts = {
    add(ghostName) {
      if (this[ghostName] === undefined) {
        this[ghostName] = ghost(GHOSTS_PRESET[ghostName].x, GHOSTS_PRESET[ghostName].y, ghostName)
        return this[ghostName]
      }
    },
  }
  pacman.x = 13
  pacman.y = 23
}



// ? Code to create a static board
//? Basically a map builder
// let staticGrid = []

// elements.grid.addEventListener('click', (e) => {
//   if (e.target.localName === 'div') {
//     if (!staticGrid.includes(e.target.innerHTML)) {
//       staticGrid.push(e.target.innerHTML)
//       e.target.classList.toggle('wall')
//     } else {
//       staticGrid = staticGrid.filter(num => num !== e.target.innerHTML)
//       e.target.classList.toggle('wall')
//     }
//   }
// })

// document.querySelector('#logmap').addEventListener('click', () => {
//   staticGrid.forEach(cell => console.log(cell))
// })



function playGame() {
  const RUNSPEED = (10000 / FRAMERATE)
  isPlaying = true
  if (!isPlaying) return
  reset()
  setup()
  elements.mainMenu.style.display = 'none'
  elements.resultWindow.style.display = 'none'
  elements.mainWindow.style.display = 'block'


  // ? start the game - loop 
  const myInterval = setInterval(() => {
    //? Teleport pacman
    if (pacman.current().classList.contains('portalLeft')
      || pacman.current().classList.contains('portalRight')) {
      pacman.teleport()
      return
    }

    pacman.move()
    //! pacman stops moving if it hits a wall while moving in a 
    //! given direction until player turns pacman
    //start pacman move and eatFood methods
    pacman.eatFood()
  }, RUNSPEED - 200)


  const myInterval1 = setInterval(() => {
    //? have ghosts move towards random directions in the grid
    // make ghosts move in a given direction until they have to turn if there are 2 or more 
    // choices at an intersection choose randomly
    const array = Object.entries(activeGhosts)
    for (let i = 1; i < array.length; i++) {
      array[i][1].move()
    }

  }, RUNSPEED)

}






//* enhancements

//? Smart Ghosts


//? will choose one according to time left
// 1 Make ghosts move towards the general direction of the player
// 2 Make ghosts draw a path to the player path can overlap 

//? Responsive design

//? Persistent leaderboard using localStorage

//? Add more boards 
//? will choose one according to time left
// 1 Add different static boards for each level up
// 2 Dynamically generate boards 

//? Each board gets more difficult
// I will do this by decresing exists from paths



