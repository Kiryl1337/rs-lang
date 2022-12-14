import {
  Component, Output, EventEmitter, OnInit,
} from '@angular/core';
import { AuthModalService } from '../services/auth-modal.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnInit {
  @Output() toggleMenuEvent = new EventEmitter<boolean>();

  constructor(public authModalService: AuthModalService) {

  }

  ngOnInit(): void {
    this.authModalService.checkAuthenticated();
  }

  public visibility = false;

  isOpenMenu = false;

  toggleMenu(): void {
    this.isOpenMenu = !this.isOpenMenu;
    this.toggleMenuEvent.emit(this.isOpenMenu);
  }

  closeMenu(): void {
    this.isOpenMenu = false;
    this.toggleMenuEvent.emit(this.isOpenMenu);
  }
}
