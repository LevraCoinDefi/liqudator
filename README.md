# Liqudator
Liquidation Bot


## Server Install
```
sudo apt update
sudo apt install -y git nano
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo npm install -g pm2

git clone https://github.com/LevraCoinDefi/liqudator.git
cd liquidator
nano .env 
<<<<< put config, save, exit
npm i
npm run build
sudo pm2 start ecosystem.config.js
sudo pm2 save
sudo pm2 startup

sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
swapon --show
free -h
```

## PM2 Plus (optional)
1. login to https://app.pm2.io/
2. Run link command provided !!! with `sudo`  