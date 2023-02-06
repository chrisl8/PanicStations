#!/usr/bin/env bash
# shellcheck disable=SC2059 disable=SC2129
# Run this on you Raspberry Pi to make everything work!

GIT_REPO_AND_FOLDER=PanicStations

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
#PURPLE='\033[0;35m'
#LIGHT_PURPLE='\033[1;35m'
YELLOW='\033[1;33m'
#LIGHTCYAN='\033[1;36m'
#LIGHTBLUE='\033[1;34m'
#LIGHTPURPLE='\033[1;35m'
NC='\033[0m' # NoColor

sudo apt update
sudo apt upgrade -y

PACKAGE_TO_INSTALL_LIST=()
PACKAGE_TO_INSTALL_LIST+=(git)
#git - Used to copy source code to pi
PACKAGE_TO_INSTALL_LIST+=(build-essential)
#build-essential - Required to build the node serialport binaries

printf "\n${YELLOW}[Cloning or Updating git repositories]${NC}\n"
cd

printf "${BLUE}${GIT_REPO_AND_FOLDER} repository${NC}\n"
if ! [[ -d ${HOME}/${GIT_REPO_AND_FOLDER} ]]; then
  git clone https://github.com/chrisl8/${GIT_REPO_AND_FOLDER}.git
else
  cd "${HOME}"/${GIT_REPO_AND_FOLDER}
  #git pull # TODO: This won't work on my synced version. I'm not sure how to check for that.
fi

if ! (id | grep dialout >/dev/null); then
  printf "\n${GREEN}Adding your user to the 'dialout' group for USB port access.${NC}\n"
  sudo adduser "${USER}" dialout >/dev/null
  printf "${RED}You may have to reboot before you can use USB ports.${NC}\n"
fi

printf "\n${YELLOW}[Installing and Initializing the Current Node LTS version]${NC}\n"

printf "${BLUE}[Installing/Updating Node Version Manager]${NC}\n"
if [[ -e ${HOME}/.nvm/nvm.sh ]]; then
  printf "${BLUE}Deactivating existing Node Version Manager:${NC}\n"
  export NVM_DIR="${HOME}/.nvm"
  # shellcheck source=/home/chrisl8/.nvm/nvm.sh
  [[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh" # This loads nvm
  nvm deactivate
fi

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
export NVM_DIR="${HOME}/.nvm"
# shellcheck source=/home/chrisl8/.nvm/nvm.sh
[[ -s "$NVM_DIR/nvm.sh" ]] && . "$NVM_DIR/nvm.sh" # This loads nvm

export NVM_SYMLINK_CURRENT=true
if ! (grep NVM_SYMLINK_CURRENT ~/.bashrc >/dev/null); then
  printf "\n${YELLOW}[Setting the NVM current environment in your .bashrc file]${NC}\n"
  sh -c "echo \"export NVM_SYMLINK_CURRENT=true\" >> ~/.bashrc"
fi
nvm install node
nvm use node
nvm alias default node

printf "\n${BRIGHT_MAGENTA}Installing latest NPM version${NC}\n"
npm i -g npm

printf "\n${BRIGHT_MAGENTA}Installing PM2${NC}\n"
npm i -g pm2

cd "${HOME}/${GIT_REPO_AND_FOLDER}/node"
printf "\n${YELLOW}[Grabbing node dependencies for Node.js scripts]${NC}\n"
printf "${BLUE}You may get some errors here, that is normal. As long as things work, it is OK.$NC\n"
npm ci

if ! (crontab -l >/dev/null 2>&1) || ! (crontab -l | grep startService >/dev/null 2>&1); then
  printf "\n${YELLOW}[Adding cron job to start server on system reboot.]${NC}\n"
  # https://stackoverflow.com/questions/4880290/how-do-i-create-a-crontab-through-a-script
  (
    echo "@reboot ${HOME}/${GIT_REPO_AND_FOLDER}/startService.sh > ${HOME}/crontab.log"
  ) | crontab -
fi
