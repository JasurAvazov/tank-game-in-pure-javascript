let myGamePiece
let myMuzzle
let myBullets = []
let bulletCooldown = 0
let myCube
let score = 0
let lastShotTime = 0
let tankSpeed = 2

document.addEventListener("keydown", handleKeyDown)
document.addEventListener("keyup", handleKeyUp)

let keys = {
  'KeyW': false,
  'KeyA': false,
  'KeyS': false,
  'KeyD': false,
  'Space': false,
}


function handleKeyDown(e) {
  if (e.code === 'Space' && !keys.Space) {
    keys.Space = true
    shootBullet()
  } else {
    keys[e.code] = true
    updateAcceleration()
  }
}

function handleKeyUp(e) {
  if (e.code === 'Space') {
    keys.Space = false
  } else {
    keys[e.code] = false
    updateAcceleration()
  }
}

function updateAcceleration() {
  myGamePiece.speedX = 0
  myGamePiece.speedY = 0

  if (keys.KeyW) {
    myGamePiece.speedY = -tankSpeed
  } else if (keys.KeyS) {
    myGamePiece.speedY = tankSpeed
  }

  if (keys.KeyA) {
    myGamePiece.speedX = -tankSpeed
  } else if (keys.KeyD) {
    myGamePiece.speedX = tankSpeed
  }
}

function startGame() {
  myGamePiece = new Component(75, 75, "#383838", 900, 500)
  myMuzzle = new Muzzle(70, 10, 0, "#2e2e2e")
  myCube = new Cube(50, 50, "green", Math.random() * (myGameArea.canvas.width - 50), Math.random() * (myGameArea.canvas.height - 50))
  myGamePiece.gravity = 0
  myGameArea.start()
}

function shootBullet() {
  if (bulletCooldown <= 0) {
    let muzzleEnd = getMuzzleEnd()
    let bullet = new Bullet(10, 10, myMuzzle.angle, "red", muzzleEnd.x, muzzleEnd.y)
    myBullets.push(bullet)
    bulletCooldown = 20
    lastShotTime = Date.now()
  }
}

function Bullet(width, height, angle, color, x, y) {
  this.width = width
  this.height = height
  this.angle = angle
  this.speed = 10
  this.x = x
  this.y = y
  this.update = function () {
    ctx = myGameArea.context
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)
    ctx.fillStyle = color
    ctx.fillRect(0, -this.height / 2, this.width, this.height)
    ctx.restore()
    this.x += this.speed * Math.cos(this.angle)
    this.y += this.speed * Math.sin(this.angle)
  }
  this.crashWith = function (otherobj) {
    let myleft = this.x
    let myright = this.x + this.width
    let mytop = this.y
    let mybottom = this.y + this.height
    let otherleft = otherobj.x
    let otherright = otherobj.x + otherobj.width
    let othertop = otherobj.y
    let otherbottom = otherobj.y + otherobj.height

    return !(
      mybottom < othertop ||
      mytop > otherbottom ||
      myright < otherleft ||
      myleft > otherright
    )
  }
}

function getMuzzleEnd() {
  let x = myGamePiece.x + myGamePiece.width / 2 + myMuzzle.width / 2 * Math.cos(myMuzzle.angle)
  let y = myGamePiece.y + myGamePiece.height / 2 + myMuzzle.width / 2 * Math.sin(myMuzzle.angle)
  return { x: x + -10, y: y + -10 }
}

let myGameArea = {
  canvas: document.createElement("canvas"),

  start: function () {
    this.canvas.width = 1920
    this.canvas.height = 1080
    this.context = this.canvas.getContext("2d")
    document.body.insertBefore(this.canvas, document.body.childNodes[0])
    this.frameNo = 0
    // this.interval = setInterval(updateGameArea, 20)
    updateGameArea()
  },

  clear: function () {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }
}

function Component(width, height, color, x, y) {
  this.width = width
  this.height = height
  this.speedX = 0
  this.speedY = 0
  this.x = x
  this.y = y
  this.update = function () {
    ctx = myGameArea.context
    ctx.fillStyle = color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
  this.newPos = function () {
    this.x += this.speedX
    this.y += this.speedY

    this.x = Math.min(Math.max(this.x, 0), myGameArea.canvas.width - this.width)
    this.y = Math.min(Math.max(this.y, 0), myGameArea.canvas.height - this.height)
  }
}

function updateGameArea() {
  myGameArea.clear()
  myGamePiece.newPos()
  myGamePiece.update()
  myMuzzle.update()

  for (let i = 0; i < myBullets.length; i++) {
    myBullets[i].update()
  }

  if (bulletCooldown > 0) {
    bulletCooldown--
  }

  for (let i = 0; i < myBullets.length; i++) {
    if (myBullets[i].crashWith(myCube)) {
      myCube.teleport()
      myBullets.splice(i, 1)
      bulletCooldown = 0
      lastShotTime = Date.now()
      score++
      i--
    }
  }

  ctx = myGameArea.context
  ctx.fillStyle = "black"
  ctx.font = "20px Arial"
  ctx.fillText("Score: " + score, 10, 30)

  myCube.update()

  requestAnimationFrame(updateGameArea)
}

function Muzzle(width, height, angle, color) {
  this.width = width
  this.height = height
  this.angle = angle
  this.update = function () {
    ctx = myGameArea.context
    ctx.save()
    ctx.translate(myGamePiece.x + myGamePiece.width / 2, myGamePiece.y + myGamePiece.height / 2)
    ctx.rotate(this.angle)
    ctx.fillStyle = color
    ctx.fillRect(0, -this.height / 2, this.width, this.height)
    ctx.restore()
    this.angle += 0.03
  }
}

function Cube(width, height, color, x, y) {
  this.width = width
  this.height = height
  this.x = x
  this.y = y
  this.update = function () {
    ctx = myGameArea.context
    ctx.fillStyle = color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
  this.teleport = function () {
    this.x = Math.random() * (myGameArea.canvas.width - this.width)
    this.y = Math.random() * (myGameArea.canvas.height - this.height)
  }
}

startGame()
