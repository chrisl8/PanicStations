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
#git - Used to update source code on pi
PACKAGE_TO_INSTALL_LIST+=(build-essential)
#build-essential - Required to build the node serialport binaries
PACKAGE_TO_INSTALL_LIST+=(curl)
#curl - Required by gh install and some other tools

sudo apt install -y "${PACKAGE_TO_INSTALL_LIST[@]}"

if ! (command -v gh >/dev/null); then
  # https://github.com/cli/cli/blob/trunk/docs/install_linux.md
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
  sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list >/dev/null
  sudo apt update
  sudo apt install gh -y
fi

printf "\n${YELLOW}[Cloning or Updating git repositories]${NC}\n"
cd

printf "${BLUE}${GIT_REPO_AND_FOLDER} repository${NC}\n"
if ! [[ -d ${HOME}/${GIT_REPO_AND_FOLDER} ]]; then
  gh repo clone https://github.com/chrisl8/${GIT_REPO_AND_FOLDER}.git
else
  cd "${HOME}"/${GIT_REPO_AND_FOLDER}
  git pull
fi

if ! (id | grep dialout >/dev/null); then
  printf "\n${GREEN}Adding your user to the 'dialout' group for USB port access.${NC}\n"
  sudo adduser "${USER}" dialout >/dev/null
  printf "${RED}You may have to reboot before you can use USB ports.${NC}\n"
fi

printf "\n${YELLOW}[Installing and Initializing the Latest Node version]${NC}\n"

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
pm2 install pm2-logrotate # Otherwise logs can grow to fill disk space
pm2 set pm2-logrotate:retain 1

cd "${HOME}/${GIT_REPO_AND_FOLDER}"
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

printf "\n${YELLOW}-----------------------------------${NC}\n"
printf "${YELLOW}ALL DONE! EDIT FILES, REBOOT, AND START TESTING!${NC}\n\n"
printf "${GREEN}Remember to ADD a settings.json5 config files to ${HOME}/${GIT_REPO_AND_FOLDER}${NC}\n\n"
printf "${LIGHTCYAN}You can find Example config files in the examples folder.${NC}\n"
printf "\n"
printf "${GREEN}Look at README.md for more information.${NC}\n"

printf "\n${YELLOW}------------------------------------------------------------${NC}\n"
