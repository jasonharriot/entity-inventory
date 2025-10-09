#!/bin/bash

echo "Installing Entity Inventory service @ $(date)"

cd $(dirname $0)

#Configuration variables:

repositorydirpath="$(realpath .)"	#Absolute path to the directory where this script lives, which should be the root of the repository.
#daemonuser="pidaq"	#Username for the daemon user. Must match that of the service file.
daemonuser="pi"	#pi is the login user. Separate daemon user will not be used.
hostname="einventory"	#This script changes the hostname of the pi to pidaq.local.
daemondirpath="/var/einventory"	#Directory where the daemon start script lives. It is a symlink to a script in this directory.



#
generalerror=0




#Checks
if [ $(whoami) != "pi" ]; then
	echo "Please run as pi. Do not run as root or another user."
	generalerror=1
fi






#Change hostname

sudo su -c "printf \"$hostname\" > /etc/hostname" root

e=$?

if [ $e -eq "0" ]; then
	echo "Changed hostname to $(cat /etc/hostname)"
else
	echo "Couldn't change hostname. Hostname is currently: $(cat /etc/hostname). ($e)"
	generalerror=1
fi




#Configure linked directory in /var. All hardcoded paths such as in the .service file will point to /var/einventory.

sudo rm "$daemondirpath"	#Remove symlink

e=$?

if [ $e -eq "0" ]; then
	echo "Removed old daemon directory/symlink."
else
	echo "Failed to remove old daemon directory/symlink. ($e)"
	generalerror=1
fi

sudo ln -s "$repositorydirpath" "$daemondirpath" > /dev/null 2>&1

e=$?

if [ $e -eq "0" ]; then
	echo "Created daemon dir symlink."
else
	echo "Couldn't create daemon dir symlink $daemondirpath. ($e)"
	generalerror=1
fi

sudo chown -h "$daemonuser:$daemonuser" "$daemondirpath" > /dev/null 2>&1

e=$?

if [ $e -eq "0" ]; then
	echo "Set permissions for dir symlink."
else
	echo "Couldn't set permissions for dir symlink. ($e)"
	generalerror=1
fi





# Start service
servicefilepath="$repositorydirpath/einventory.service" 

sudo rm "/etc/systemd/system/einventory.service" > /dev/null 2>&1

sudo ln -s "$servicefilepath" "/etc/systemd/system/" > /dev/null 2>&1

e=$?

if [ $e -eq "1" ]; then
	echo "Symlink $servicefilepath already exists."
elif [ $e -eq "0" ]; then
	echo "Created service symlink $servicefilepath."
else
	echo "Failed to create service symlink $servicefilepath. ($e)"
	generalerror=1
fi

sudo systemctl enable "einventory.service"

systemctl status "einventory.service" > /dev/null 2>&1

e=$?

if [ $e -eq "3" ]; then
	echo "Daemon is dead. ($e)"
	generalerror=1
elif [ $e -eq "4" ]; then
	echo "Daemon service does not exist. ($e)"
	generalerror=1
elif [ $e -eq "0" ]; then
	echo "Daemon is running."
fi


















#End section

if [ $generalerror -eq "0" ]; then
	echo "Server configuration completed without errors. The hostname change may not come into effect until a reboot."
else
	echo "Configuration did not complete sucessfully, please fix the issues."
fi

echo "Installation done @ $(date)"


