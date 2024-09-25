const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const audios = [
    'dio-canaja-de-dio.mp3',
    'ma-che-oh.mp3',
    'mosconi1.mp3',
    'mosconi2.mp3',
    'nopossibile.mp3',
    'orcodx3.mp3',
    'portanna-la-madonna.mp3',
    'se_non_bestemmio.mp3',
    'vafaculo.mp3'
];

let mosconi = new Image();
mosconi.src = 'asset/img/mosconi.png';

let life = new Image();
life.src = 'asset/img/mosconi.png';

let porco = new Image();
porco.src = 'asset/img/porco.png';

let troia = new Image();
troia.src = 'asset/img/troia.png';

let ground = new Image();
ground.src = 'asset/img/flame.png';
let groundX = 0;
let groundSpeed = 2;

let background = new Image();
background.src = 'asset/img/bg.jpg';
let backgroundX = 0;
let backgroundSpeed = 0.5;

let idInterval;
let idAnimation;
let score = 0;
let vite = 5;
let isRunning = false;
let isCollision = false;
let gameover = false;
const obstacles = [];

const player = {
    x: 50,
    y: 50,
    velocityY: 0,
    gravity: 0.4,
    jumpStrength: -7,
    isJumping: false
};

const towerUp = new Image();
towerUp.src = 'asset/img/pipe-up.png';
const towerDown = new Image();
towerDown.src = 'asset/img/pipe-down.png';

porco.onload = () => {porco = drawRresizedImage(porco, 60);}
life.onload = () => {life = drawRresizedImage(life, 20);}
troia.onload = () => {troia = drawRresizedImage(troia, 70);}





canvas.addEventListener('click', () => {
    player.velocityY = player.jumpStrength;
})

function drawRresizedImage(image, width){
    const finalWidth = width;
    const finalHeight = finalWidth / image.width * image.height
    const tempCanvas = document.createElement('canvas');
    const tempContext = tempCanvas.getContext('2d');
    tempCanvas.width = finalWidth;
    tempCanvas.height = finalHeight;
    tempContext.clearRect(0, 0, finalWidth, finalHeight);
    tempContext.drawImage(image, 0, 0, finalWidth, finalHeight);
    return tempCanvas;
}

function spawnObstacle(){
    const random = Math.floor(Math.random() * 2);
    let image = random === 0 ? porco : troia;
    const y = Math.floor(Math.random() * (canvas.height - ground.height - porco.height));
    obstacles.push({
        x : canvas.width, 
        y : y, 
        width : image.width, 
        height : image.height,
        image : image,
        touched : false
    });
}

function gameLoop(){

    if(!isRunning) return;

    context.clearRect(0, 0, canvas.width, canvas.height);


    groundX -= groundSpeed;
    backgroundX -= backgroundSpeed;

    if(groundX <= -canvas.width){
        groundX = 0;
    }

    if(backgroundX <= -canvas.width){
        backgroundX = 0;
    }
    context.drawImage(background, backgroundX, canvas.height - background.height - 50, canvas.width, background.height);
    context.drawImage(background, backgroundX + canvas.width, canvas.height - background.height - 50, canvas.width, background.height);

    context.drawImage(ground, groundX, canvas.height - ground.height, canvas.width, ground.height);
    context.drawImage(ground, groundX + canvas.width, canvas.height - ground.height, canvas.width, ground.height);

    

    context.font = '30px Arial bold';
    context.fillStyle = '#fff';
    context.textAlign = 'start';
    context.textBaseline = 'top';

    context.fillText(`Score ${score}`, 10, 10);

    for(let i = 1; i <= vite; i++){
        const x = canvas.width - ((20 + life.width) * i);
        context.drawImage(life, x, 10, life.width, life.height);
    }

    // Gravità
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Evita che il personaggio esca dallo schermo (pavimento)
    if (player.y + player.height > canvas.height - ground.height + 60) {
        // player.y = canvas.height - ground.height - player.height;
        player.velocityY = -15;
    }

    if(player.y <= 10) player.y = 10;

    context.drawImage(mosconi, player.x, player.y, player.width, player.height);

    if(obstacles.length > 0){
        obstacles.forEach((obstacle, i) => {
            obstacle.x -= 10;

            if(checkCollision(player, obstacle)){
                obstacle.touched = true;
                if(isCollision === false){
                    isCollision = true;
                    vite--;
                    console.log("Collisione");
                    const fileSrc = audios[Math.floor(Math.random() * audios.length)];
                    const audio = new Audio(`asset/audio/${fileSrc}`);
                    audio.play();
                    setTimeout(() => {
                        isCollision = false;
                    }, 500);
                    if(vite === 0){
                        gameover = true;
                        vite = 5;
                        obstacles.length = 0;
                        player.x = 50;
                        player.y = 50;
                        score = 0;
                        stop();
                    }
                }
            }

            context.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            if(obstacle.x + obstacle.width < 0){
                if(!obstacle.touched){
                    score++;
                }
                obstacles.splice(i, 1);
            }
           
        })
    }

    idAnimation = requestAnimationFrame(gameLoop);
}

ground.onload = () => {
    background.onload = () => {
        mosconi.onload = () => {
            ground = drawRresizedImage(ground, canvas.width);
            background = drawRresizedImage(background, canvas.width);
            mosconi = drawRresizedImage(mosconi, 40);
            player.width = mosconi.width;
            player.height = mosconi.height;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(background, 0, canvas.height - background.height - 50, canvas.width, background.height);
            context.drawImage(ground, 0, canvas.height - ground.height, canvas.width, ground.height);
            context.drawImage(mosconi, player.x, player.y, player.width, player.height);
        }
    }
}

function start(){
    if(isRunning) return;
    isRunning = true;
    if(gameover){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(background, 0, canvas.height - background.height - 50, canvas.width, background.height);
        context.drawImage(ground, 0, canvas.height - ground.height, canvas.width, ground.height);
        context.drawImage(mosconi, player.x, player.y, player.width, player.height);
    }
    gameLoop();
    idInterval = setInterval(spawnObstacle, 2500);
}

function stop(){
    isRunning = false;
    clearInterval(idInterval);
    cancelAnimationFrame(idAnimation);
}

function checkCollision(player, obstacle){
    return (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
    );
}