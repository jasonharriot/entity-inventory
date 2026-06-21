#!/bin/bash

#This script installs Entity Inventory on the system.

prompt() {	#prompt <prompt text> [default option [y, n]]
	#Returns 0 if yes, 1 if no.
	#Demands yes or no if no default set.

	defaultset=0
	defaultisyes=1
	yestext=y
	notext=n

	if [[ $2 =~ ^[yY] ]]; then
		#echo "prompt() using default: Y"
		defaultset=1
		#defaultisyes=1
		yestext=Y
		#notext=n
	elif [[ $2 =~ ^[nN] ]]; then
		#echo "prompt() using default: N"
		defaultset=1
		defaultisyes=0
		#yestext=y
		notext=N
	fi


	while true; do
		read -r -p "$1 ($yestext/$notext) " choice

		case $choice in
			[yY]) return 0 ;;
			[nN]) return 1 ;;
			*) if [ $defaultset -eq 1 ]; then
				if [ $defaultisyes -eq 0 ]; then
					#echo "Defaulting to no."
					return 1;
				else
					#echo "Defaulting to yes."
					return 0;
				fi
			fi
		esac
	done
}

echo "Installing Entity Inventory @ $(date)"

#Configuration variables:

repopath="$(realpath $(dirname $0))"	#Absolute path to the directory where this script lives, which should be the root of the repository.
daemonuser="einvuser"
daemongroup="$daemonuser"
installpath="/var/einventory"
serviceinstallpath="/etc/systemd/system"
appsrcpath="$repopath/node"	#Source of the web app source
appmode="755"
servicename="einventory.service"	#Name of the service file
servicepath="$repopath/service/$servicename"	#Source of the systemd configuration file
startscriptpath="$repopath/node/start.sh"


do_install() {
	e=0

	#
	echo "Installing from: $repopath"
	echo "Creating user $daemonuser..."
	sudo useradd -m "$daemonuser"

	e=$?

	if [[ $e -ne 0 && $e -ne 9 ]]; then
		echo "Failed to add user $daemonuser."
		return 1
	fi


	echo "Stopping service..."
	sudo systemctl stop "$servicename"

	e=$?

	if [[ $e -ne 0 ]]; then
		echo "Failed to stop the service."
		return 1
	fi


	#Install nvm
	sudo su einvuser -c 'wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash'

	#Install npm

	#Warning: This functionality hasn't been validated yet.
	#sudo apt install -y npm
	#



	#Install program files
	#find "$appsrcpath" -type f -exec 'install -v -D -o "$daemonuser" -g "$daemonuser" -m 751 -t "$installpath/{}" "{}"'

	echo "Copying program files..."
	sudo mkdir -p "$installpath"

	e=$?

	sudo cp -r "$appsrcpath/." "$installpath/"

	[ "$?" -ne 0 -o "$e" -ne 0 ] && e=1

	sudo chown -R "$daemonuser":"$daemongroup" "$installpath"

	[ "$?" -ne 0 -o "$e" -ne 0 ] && e=1

	sudo chmod -R "$appmode" "$installpath"

	[ "$?" -ne 0 -o "$e" -ne 0 ] && e=1



	#Install start script with proper permissions
	echo "Installing start scsript..."
	sudo install -o "$daemonuser" -g "$daemonuser" -m 744 -t "$installpath" "$startscriptpath"

	if [[ $e -ne 0 ]]; then
		echo "Failed to install program files in $installpath."
		echo "Current contents of install path:"
		ls -la "$installpath"
		return 1
	fi



	#Install required node packages.
	echo "Installing node packages..."
	sudo su einvuser -c "(cd $installpath && npm install)"



	#Install systemd service files

	echo "Copying service files..."
	sudo install -o "root" -g "root" -m 400 -t "$serviceinstallpath" "$servicepath"

	e=$?

	echo "Starting daemon..."
	sudo systemctl enable "$servicename"

	[ "$?" -ne 0 -o "$e" -ne 0 ] && e=1

	sudo systemctl restart "$servicename"

	[ "$?" -ne 0 -o "$e" -ne 0 ] && e=1

	if [ $e -ne 0 ]; then
		echo "Failed to start the daemon."
		return 1
	fi

	sleep 5

	systemctl status "$servicename" > /dev/null 2>&1

	e=$?

	if [ $e -ne 0 ]; then
		echo "The daemon is dead. Check \"journalctl -xeu einventory.service\"."
		return 1
	fi



	#Fetch hostname from the config file and set it.
	hostname=$(cd "$installpath" && printf "config = require('config')\nconsole.log(config.get('hostname').split('.')[0])" | node)

	if prompt "Change hostname to \"$hostname\"? It is currently set to \"$(cat /etc/hostname)\"." y; then
		#sudo su -c "printf \"$hostname\" > /etc/hostname" root
		sudo hostnamectl --static set-hostname "$hostname"
		e=$?
		echo "Changed hostname to $(cat /etc/hostname)."
	fi

	if [[ $e -ne 0 ]]; then
		echo "Couldn't change hostname. Hostname is: $(cat /etc/hostname). ($e)"
		return 1
	fi
}


#End section

do_install

if [ $? -eq 0 ]; then
	printf "\n\n\nInstallation completed without errors. If the hostname was changed, please reboot now.\n"
	exit 0
else
	printf "\n\n\nConfiguration did not complete sucessfully, please fix the issues.\n"
	exit 1
fi