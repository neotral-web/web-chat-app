import { Component, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { Router } from "@angular/router";
import { ChangeDetectorRef } from "@angular/core";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username:string = localStorage.getItem('username');
  email:string = '';
  emailField:string = '';
  groups = [];
  channels = [];
  showGroupsBool = true;
  showChannelsBool = false;
  title:string = 'Dashboard';

  isGroupAdmin = false;
  isSuperAdmin = false;

  // all of the user's data
  userData;

  // groups retrieved if admin
  allGroups;

  constructor(private usersService:UsersService, private router:Router, private ref: ChangeDetectorRef) {
    this.getUser();
   }

  ngOnInit() {
    console.log("Logged in as " + this.username);
  }

  getUser() {
    this.usersService.getUser(this.username).subscribe(
      data => {
        this.userData = data;
      },
      err => {
        console.error
      },
      () => {
        console.log('\tUser retrieved')
        console.log(this.userData);

        // update data (email, groups, channels, admin privileges)
        this.email = this.userData.email;
        this.groups = this.userData.groups
        this.isGroupAdmin = this.userData.groupAdmin;
        this.isSuperAdmin = this.userData.superAdmin;

        this.getGroups(); // get the groups if this user is admin
      }
    );
  }

  updateEmail() {
    this.usersService.updateEmail(this.username, this.emailField)
    .subscribe(
      (data) => {
        data = JSON.stringify(data);
        console.log('POST call successful. Sent ' + data);
        this.email = this.emailField;
        this.emailField = '';
      },
      (err) => {
        console.log('Error in POST call. Error: ' + err);
      },
      () => {
        console.log('POST call completed.');
      }
    );
  }

  logOut() {
    this.router.navigateByUrl('/');
  }

  /**
   * Route to the group page
   * @param group The group object
   */
  viewGroup(group) {
    if(this.isGroupAdmin || this.isSuperAdmin) {
      console.log(`Viewing group ${group}`);
      localStorage.setItem('currentGroup', group);
      this.router.navigateByUrl('/group');
    }
    else {
      console.log(`Viewing group ${group.name}`);
      localStorage.setItem('currentGroup', group.name);
      this.router.navigateByUrl('/group');
    }
    
  }

  createGroupName:string = '';

  createGroup() {
    if(this.allGroups.includes(this.createGroupName)) {
      alert(`Group ${this.createGroupName} already exists`);
      return;
    }
    console.log(`Creating group ${this.createGroupName}`);

    this.usersService.createGroup(this.username, this.createGroupName)
    .subscribe(
      (data) => {
        console.log(data);
        console.log('POST call successful. Sent ' + data);
        this.allGroups = data;
        console.log(this.allGroups);
      },
      (err) => {
        console.log('Error in POST call. Error: ' + err);
      },
      () => {
        console.log('POST call completed.');
      }
    );
  }

  getGroups() {
    if(this.isSuperAdmin || this.isGroupAdmin) {
      console.log('Admin fetching all groups');
      this.usersService.getGroups().subscribe(
        data => {
          this.allGroups = data;
          console.log(data);
        },
        err => {
          console.error
        },
        () => {
          console.log('Finished retrieving groups for admin user');
        }
      )
    }
  }

  removeGroup(group) {
    if(group === 'newbies' || group === 'general') {
      alert('Cannot remove these default groups from the system');
    }
    else {
      console.log(`Removing group ${group} from the system.`);
      this.usersService.removeGroup(group).subscribe(
        data => {
          console.log("Received data: " + data);
          this.allGroups = data;
        },
        err => {
          console.error
        },
        () => {
          console.log("Finished removing group " + group);
        }
      );
    }
  }

}
