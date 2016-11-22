// snake.js
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'snake', { preload: preload, create: create, update: update })
var sprite

function preload () {
  game.load.image('red', 'red.png')
  game.load.image('teal', 'teal.png')
}

function reset_snake () {
  // create our snake
  direction = [-1, 0]
  add_segment()
  add_segment()
  add_segment()

  score = 0
}

function create () {
  game.world.setBounds(0, 0, game.width, game.height)

  reset_snake()

  // title
  var style = { font: '32px Arial', fill: '#ff0044', align: 'center' }
  var text = game.add.text(70, 16, 'Snakins', style)
  text.anchor.set(0.5)

  // score
  var style = { font: '32px Arial', fill: '#ff0044', align: 'center' }
  scoreText = game.add.text(game.world.width - 200, 16, 'score: ' + score.toString(), style)
  text.anchor.set(0.5)
}

var timeSinceLastSpawn = 0
var timeSinceLastMove = 0
var direction
var segments_pos = []
var segment_sprites = []
var candies = []
var candy_sprites = []

var score = 0
var scoreText

var cellWidth = 50
var cellHeight = 50

function add_segment () {
  var newX = 0
  var newY = 0

  if (segments_pos.length === 0) {
    newX = game.world.width / cellWidth / 2
    newY = game.world.height / cellHeight / 2

    sprite = game.add.sprite(newX * cellWidth, newY * cellHeight, 'teal')
    // sprite.anchor.set(0.5)
    sprite.scale.set(5)

    segments_pos.push([newX, newY])
    segment_sprites.push(sprite)
  } else if (segments_pos.length === 1) {
    // opposite to direction
    newX = segments_pos[0][0] + direction[0] * -1
    newY = segments_pos[0][1] + direction[1] * -1

    segments_pos.push([newX, newY])
    sprite = game.add.sprite(newX * cellWidth, newY * cellHeight, 'teal')
    sprite.scale.set(5)
    segment_sprites.push(sprite)
  } else {
    var [xEnd, yEnd] = segments_pos[segments_pos.length - 1]
    var [x2, y2] = segments_pos[segments_pos.length - 2]

    if (xEnd === x2) {
      newX = xEnd
      if (y2 < yEnd) {
        newY = yEnd + 1
      } else {
        newY = yEnd - 1
      }
    } else if (yEnd === y2) {
      newY = yEnd
      if (x2 < xEnd) {
        newX = xEnd + 1
      } else {
        newX = xEnd - 1
      }
    } else {
      // should never be here
      console.log('Error')
    }
    segments_pos.push([newX, newY])
    sprite = game.add.sprite(newX * cellWidth, newY * cellHeight, 'teal')
    sprite.scale.set(5)
    segment_sprites.push(sprite)
  }
}

function move_snake () {
  if (segments_pos.length === 0 || direction === undefined) {
    return
  }
  if (segments_pos.length > 1) {
    for (var i = segments_pos.length - 1; i > 0; i--) {
      segments_pos[i] = segments_pos[i - 1]
    }
    // update sprites
    for (var j = 1; j < segment_sprites.length; j++) {
      segment_sprites[j].x = segments_pos[j][0] * cellWidth
      segment_sprites[j].y = segments_pos[j][1] * cellHeight
    }
  }

  // find new position of head sprite
  var new_pos = [segments_pos[0][0] + direction[0], segments_pos[0][1] + direction[1]]

  // check for event triggers
  segments_pos.forEach(function (pos) {
    if (pos[0] === new_pos[0] && pos[1] === new_pos[1]) {
      dead()
    }
  })

  candies.forEach(function (candy) {
    if (candy[0] === new_pos[0] && candy[1] === new_pos[1]) {
      // TODO : figure out why this doesn't always hit
      add_segment()
      candy_sprites[candies.indexOf(candy)].destroy(true)
      candy_sprites.splice(candies.indexOf(candy), 1)
      candies.splice(candies.indexOf(candy), 1)

      score += 10
      scoreText.text = 'score: ' + score.toString()
    }
  })

  if (new_pos[0] < 0 || new_pos[0] > game.world.width / cellWidth) {
    dead()
  } else if (new_pos[1] < 0 || new_pos[1] > game.world.height / cellHeight) {
    dead()
  }

  segments_pos[0] = new_pos

  // update first head sprite
  segment_sprites[0].x = segments_pos[0][0] * cellWidth
  segment_sprites[0].y = segments_pos[0][1] * cellHeight
}

function dead () {
  console.log('dead')
  direction = undefined
}

function add_candy () {
  var no_collision = false
  var x = 0
  var y = 0

  while (!no_collision) {
    x = Math.ceil(Math.random() * game.world.width / cellWidth)
    y = Math.ceil(Math.random() * game.world.height / cellHeight)

    no_collision = true
    segments_pos.forEach(function (segment) {
      if (segment[0] === x && segment[1] === y) {
        no_collision = false
      }
    })
  }

  var candy = game.add.sprite(x * cellWidth, y * cellHeight, 'red')
  candy.scale.set(5)
  candy_sprites.push(candy)
  candies.push([x, y])
}

function update () {
  timeSinceLastSpawn += game.time.elapsed
  if (direction && timeSinceLastSpawn > 3000) {
    // add a candy
    add_candy()
    timeSinceLastSpawn = 0
  }

  // set direction
  if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
    direction = [-1, 0]
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
    direction = [1, 0]
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
    direction = [0, -1]
  } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
    direction = [0, 1]
  }

  // update segment positions
  timeSinceLastMove += game.time.elapsed
  var move_wait = 800 - 25 * segments_pos.length
  if (timeSinceLastMove > move_wait) {
    if (direction) {
      move_snake()
    }
    timeSinceLastMove = 0
  }
}
