const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const btnStart = document.getElementById('btnStart');
const turnMessage = document.getElementById('landscape');

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

const player = {
    x: 0,
    y: 0,
    velocityY: 0,
    gravity: 0.5,
    jumpStrength: -8,
};

const text = {
    x : 0,
    y : 0,
    fontSize : 0
}

let background, ground, mosconi, porco, troia, lifeImage;

const audioJump = new Audio('asset/audio/jump.wav');
audioJump.volume = 0.2;
const scoreAudio = new Audio('asset/audio/score.wav');

let groundX = 0;
let groundSpeed = 2;

let backgroundX = 0;
let backgroundSpeed = 0.5;

let obstacleSpeed = 5;

let idInterval;
let idAnimation;
let score = 0;
let lifes = 5;
let isRunning = false;
let isCollision = false;
let gameover = false;
const obstacles = [];



window.addEventListener('resize', () => {
    resizeImages();
});

canvas.addEventListener('click', () => {
    audioJump.play();
    player.velocityY = player.jumpStrength;
})

function scaleXFactor(sx){
    return canvas.width * (sx / 850) | 0;
}

function scaleYFactor(sy){
    return canvas.height * (sy / 478.125) | 0;
}

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
    let minY = scaleYFactor(50);
    let maxY = canvas.height - ground.height - image.height;
    const y = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
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

    context.drawImage(background, backgroundX, 0, canvas.width, canvas.height);
    context.drawImage(background, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    context.drawImage(ground, groundX, canvas.height - ground.height, canvas.width, ground.height);
    context.drawImage(ground, groundX + canvas.width, canvas.height - ground.height, canvas.width, ground.height);

    

    context.font = `${text.fontSize}px Arial bold`;
    context.fillStyle = '#fff';
    context.textAlign = 'start';
    context.textBaseline = 'top';

    context.fillText(`Score ${score}`, text.x, text.y);

    

    // Gravità
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Evita che il personaggio esca dallo schermo (pavimento)
    if (player.y + player.height > canvas.height - ground.height + scaleYFactor(60)) {
        // player.y = canvas.height - ground.height - player.height;
        player.velocityY = -15;
    }

    if(player.y <= scaleYFactor(50)) player.y = scaleYFactor(50);

    context.drawImage(mosconi, player.x, player.y, player.width, player.height);

    if(obstacles.length > 0){
        obstacles.forEach((obstacle, i) => {
            obstacle.x -= obstacleSpeed;

            if(checkCollision(player, obstacle)){
                obstacle.touched = true;
                if(isCollision === false){
                    isCollision = true;
                    lifes--;
                    const fileSrc = audios[Math.floor(Math.random() * audios.length)];
                    const audio = new Audio(`asset/audio/${fileSrc}`);
                    audio.play();
                    setTimeout(() => {
                        isCollision = false;
                    }, 500);
                    if(lifes === 0){
                        gameover = true;
                    }
                }
            }

            context.drawImage(obstacle.image, obstacle.x, obstacle.y, obstacle.width, obstacle.height);

            if(obstacle.x + obstacle.width < 0){
                if(!obstacle.touched){
                    score++;
                    scoreAudio.play()
                    if(score %10 === 0){
                        obstacleSpeed += 3;
                    }
                }
                obstacles.splice(i, 1);
            }
           
        })
    }

    for(let i = 1; i <= lifes; i++){
        const x = canvas.width - ((scaleXFactor(20) + lifeImage.width) * i);
        context.drawImage(lifeImage, x, scaleYFactor(10), lifeImage.width, lifeImage.height);
    }

    if(gameover){
        gameOver();
    }

    idAnimation = requestAnimationFrame(gameLoop);
}

function gameOver(){
    lifes = 5;
    obstacles.length = 0;
    obstacleSpeed = 5;
    player.x = scaleXFactor(40)
    player.y = scaleYFactor(40);
    score = 0;
    stop();
    gameover = false;
}

function start(){
    if(isRunning) return;
    btnStart.style.display = 'none';
    isRunning = true;
    if(gameover){
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(background, 0, 0, canvas.width, canvas.height);
        context.drawImage(ground, 0, canvas.height - ground.height, canvas.width, ground.height);
        context.drawImage(mosconi, player.x, player.y, player.width, player.height);
    }
    gameLoop();
    idInterval = setInterval(spawnObstacle, 1500);
}

function stop(){
    isRunning = false;
    clearInterval(idInterval);
    cancelAnimationFrame(idAnimation);
    btnStart.style.display = 'block';
}

function checkCollision(player, obstacle){
    return (
        player.x < obstacle.x + obstacle.width &&
        player.x + player.width > obstacle.x &&
        player.y < obstacle.y + obstacle.height &&
        player.y + player.height > obstacle.y
    );
}

function loadImage(src){
    return new Promise((next, error) => {
        const img = new Image();
        img.src = src;
        img.onload = () => next(img);
        img.onerror = error;
    });
}

async function initializeScene(){
    const pathImages = [
        'asset/img/bg.jpg',
        'asset/img/flame.png',
        'asset/img/mosconi.png',
        'asset/img/porco.png',
        'asset/img/troia.png'
    ];

    try{
        [background, ground, mosconi, porco, troia] = await Promise.all(pathImages.map(loadImage));
        resizeImages();        
        
    }
    catch(error){
        console.error("Errore nel caricamento delle immagini", error);
    }
}

function resizeImages(){
    resizeCanvas();
    if(window.innerWidth < 600){
        canvas.style.display = 'none';
        btnStart.style.display = 'none';
        turnMessage.style.display = 'block';
    }
    else{
        turnMessage.style.display = 'none';
        canvas.style.display = 'block';
        btnStart.style.display = 'block';
        btnStart.style.width = scaleXFactor(100) + 'px';
        btnStart.style.height = scaleXFactor(100) + 'px';
    }
    const widthMosconi = scaleXFactor(35); 
    const widthPorco = scaleXFactor(55);  
    const widthTroia = scaleXFactor(75); 
    const widthLife = scaleXFactor(15); 
    background = drawRresizedImage(background, canvas.width);
    ground = drawRresizedImage(ground, canvas.width);
    lifeImage = drawRresizedImage(mosconi, widthLife);
    mosconi = drawRresizedImage(mosconi, widthMosconi);
    porco = drawRresizedImage(porco, widthPorco);
    troia = drawRresizedImage(troia, widthTroia);
    player.x = scaleXFactor(40);
    player.y = scaleYFactor(40);
    player.width = mosconi.width;
    player.height = mosconi.height;
    text.x = scaleXFactor(30);
    text.y = scaleYFactor(10);
    text.fontSize = scaleYFactor(30);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    context.drawImage(ground, 0, canvas.height - ground.height, canvas.width, ground.height);
    context.drawImage(mosconi, player.x, player.y, player.width, player.height);
}

function resizeCanvas(){
    const windowWidth = window.innerWidth - 9;
    const windowHeight = window.innerHeight - 9;
    const ratio16_9 = 16 / 9;
    let width, height;
    if(windowWidth >= windowHeight){
        width = windowWidth;
        height = windowWidth / ratio16_9;
        if(height > windowHeight){
            height = windowHeight;
            width = windowHeight * ratio16_9;
        }
    }
    else{
        width = windowWidth;
        height = windowWidth / ratio16_9;
    }
    canvas.width = width | 0;
    canvas.height = height | 0;
}

initializeScene();
