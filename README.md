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

```