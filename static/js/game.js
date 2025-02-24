class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('background', 'static/images/gamebg.jpg');
        this.load.image('player', 'static/images/kirby.png');
        this.load.image('coin', 'static/images/coin.png');
    }

    create() {
        // Background setup
        this.bg = this.add.tileSprite(0, 0, 1920, 885, 'background').setOrigin(0, 0);
        this.bg.displayWidth = this.scale.width;
        this.bg.displayHeight = this.scale.height;

        // Invisible ground
        this.ground = this.physics.add.staticGroup();
        let groundBlock = this.ground.create(this.scale.width / 2, this.scale.height - 10, null).setScale(100, 3.0).refreshBody();
        groundBlock.setVisible(false);

        // Player setup
        this.player = this.physics.add.sprite(this.scale.width / 2, this.scale.height - 100, 'player');
        this.player.setScale(0.5);
        this.player.setCollideWorldBounds(true); // Prevent player from going outside screen
        this.player.setBounce(0.2);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys({ A: 'A', D: 'D', SPACE: 'SPACE' });

        // Coin group (no max size)
        this.coins = this.physics.add.group();

        // Score UI (Initial positioning of score text)
        this.coinCount = 0;
        this.scoreText = this.add.text(20, 20, 'Coins: 0', { fontSize: '20px', fill: '#fff' }).setScrollFactor(0);

        // Collisions
        this.physics.add.collider(this.player, this.ground);
        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        // Spawn coins every 2 seconds
        this.time.addEvent({
            delay: 2000,
            callback: this.spawnCoin,
            callbackScope: this,
            loop: true
        });

        // Create the right wall as an invisible physics sprite
        this.rightWall = this.physics.add.staticImage(this.scale.width - 2, this.scale.height / 2, null);
        this.rightWall.setSize(5, this.scale.height); // Set its hitbox size
        this.rightWall.setVisible(false); // Make it invisible
        this.physics.add.collider(this.player, this.rightWall);


        this.time.delayedCall(100, () => {
            this.rightWall.body.updateFromGameObject();
        }, [], this);








    }

    update() {
        this.rightWall.body.updateFromGameObject();
    
        // Move background to the left
        this.bg.tilePositionX += 2;
    
        // Update score text position to stay in the top left corner
        this.scoreText.setPosition(20, 20);
    
        // Coin movement and recycling
        this.coins.children.iterate(coin => {
            if (coin.active) {
                coin.x -= 2;
                if (coin.x < -50) { // Check if coin has gone off-screen
                    coin.setActive(false).setVisible(false); // Disable and hide coin
                    coin.body.enable = false; // Disable physics body
                }
            }
        });
    
        // Player movement
        if (this.keys.A.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.keys.D.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }
    
        this.player.x = Phaser.Math.Clamp(this.player.x, this.player.width / 2, this.scale.width - this.player.width);
    
        // Jumping
        if (this.keys.SPACE.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
    }
    

    collectCoin(player, coin) {
        coin.disableBody(true, true);  // Disable coin body after collection
        this.coinCount += 1;           // Increment coin count
        this.scoreText.setText('Coins: ' + this.coinCount); // Update score text
    }

    // In your spawnCoin function, ensure the correct Y value for floating coins
// In your spawnCoin function, ensure the correct Y value for floating coins
spawnCoin() {
    // Use a higher fixed height range for floating coins above the ground
    const minFloatingHeight = 50;  // Higher minimum floating height
    const maxFloatingHeight = 100;  // Higher maximum floating height

    // Randomly select a Y value between min and max
    let coinY = Phaser.Math.Between(minFloatingHeight, maxFloatingHeight);

    let newCoin = this.coins.create(this.scale.width + 50, coinY, 'coin');
    if (newCoin) {
        newCoin.setScale(0.2);
        newCoin.setActive(true).setVisible(true);
        newCoin.setImmovable(true);
        newCoin.body.allowGravity = false;

        // Enable physics for the new coin
        this.physics.world.enable(newCoin);
        newCoin.body.setVelocityX(-100); // Coins move to the left

        // Floating animation
        this.tweens.add({
            targets: newCoin,
            y: newCoin.y + 10,
            yoyo: true,
            repeat: -1,
            duration: 800,
            ease: 'Sine.easeInOut'
        });
    }
}
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight * 0.4,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false } // Turn on debug mode
    },
    scene: GameScene
};


const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    const gameContainer = document.getElementById('game-container');
    game.scale.resize(gameContainer.offsetWidth, gameContainer.offsetHeight);

    // Resize the background to match the new game size
    if (game.scene.isActive('GameScene')) {
        const scene = game.scene.getScene('GameScene');
        
        // Resize background
        scene.bg.displayWidth = game.scale.width;
        scene.bg.displayHeight = game.scale.height;
        
        // Resize and reposition player
        scene.player.setScale(game.scale.width / 1920 * 0.5); // Scaling player
        scene.player.x = game.scale.width / 2;
        scene.player.y = game.scale.height - 100;

        // Resize ground (keep it at the bottom)
        scene.ground.getChildren().forEach(block => {
            block.setScale(game.scale.width / 1920, 3); // Adjust the width based on the new game width
            block.x = game.scale.width / 2;
            block.y = game.scale.height - 10;
        });

        // Dynamically calculate the ground Y position (based on new screen size)
        const groundY = game.scale.height - 10;  // Adjust for ground's position

        // Resize right wall (adjust the wall to new height)
        scene.rightWall.height = game.scale.height;
        scene.rightWall.x = game.scale.width - 10;

        // Now make sure coins spawn above the ground at a random Y value
        const minFloatingHeight = 150;  // Minimum height for coins
        const maxFloatingHeight = 250;  // Maximum height for coins

        // Resize and reposition coins (always floating above the ground)
        scene.coins.children.iterate(coin => {
            coin.setScale(game.scale.width / 1920 * 0.2); // Adjust coin size proportionally
            coin.x = Phaser.Math.Between(game.scale.width + 50, game.scale.width + 150); // Randomized off-screen spawn
            coin.y = Phaser.Math.Between(minFloatingHeight, maxFloatingHeight); // Random Y between min and max
        });
    }
});






window.addEventListener('load', () => {
    const gameContainer = document.getElementById('game-container');
    game.scale.resize(gameContainer.offsetWidth, gameContainer.offsetHeight);
});
