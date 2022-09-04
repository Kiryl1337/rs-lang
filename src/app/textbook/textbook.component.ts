import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Word } from '../data/interfaces';
import { UserWordsService } from '../services/user-words.service';
import { AuthModalService } from '../services/auth-modal.service';

@Component({
  selector: 'app-textbook',
  templateUrl: './textbook.component.html',
  styleUrls: ['./textbook.component.scss'],
})
export class TextbookComponent implements OnInit {
  words: Word[] = [];

  backendUrl = 'https://angular-learnwords.herokuapp.com/';

  isPlayAudio = false;

  currentId = '';

  isAuth: boolean = true; // this.authModalService.authenticated

  wordStudiedCount = 0;

  wordsPerPage = 20;

  group: number = Number(localStorage.getItem('group')) || 1;

  groupArr: number[] = [1, 2, 3, 4, 5, 6];

  page: number = Number(localStorage.getItem('page')) || 1;

  total: number = 600;

  loading: boolean = false;

  constructor(
    private http: HttpClient,
    private userWordsService: UserWordsService,
    private authModalService: AuthModalService,
  ) { }

  ngOnInit(): void {
    if (!this.isAuth) {
      console.log(123);
      this.getPage(this.page);
    } else {
      console.log(456);
      this.getAuthPage(this.page, true);
    }
  }

  getPage(page: number): void {
    this.loading = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.http.get<Word[]>(`${this.backendUrl}words?group=${this.group - 1}&page=${page - 1}`).subscribe((response) => {
      console.log('Response', response);
      this.words = response;
      this.page = page;
      this.loading = false;
    });
  }

  getAuthPage(page: number, isScroll: boolean): void {
    this.loading = true;

    if (isScroll) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const userId = this.authModalService.getUserId()!;
    this.userWordsService.getUserTextbookWords(userId, this.group - 1, page - 1)
      .subscribe((response) => {
        console.log('Response', response);
        this.words = response;
        this.page = page;
        this.loading = false;

        this.wordStudiedCount = this.words.reduce((sum, elem) => (elem.userWord?.difficulty === 'studied' ? sum + 1 : sum), 0);
        console.log(this.wordStudiedCount);
      });
  }

  changeGroup(event: Event): void {
    const thisTarget = event.target as HTMLButtonElement;
    this.group = Number(thisTarget.textContent);
    localStorage.setItem('group', String(this.group));

    if (!this.isAuth) {
      console.log(123);
      this.getPage(1);
    } else {
      console.log(456);
      this.getAuthPage(1, true);
    }
  }

  playAudio(id: string): void {
    this.currentId = id;

    this.http.get<Word>(`${this.backendUrl}words/${id}`).subscribe((response) => {
      let audio = new Audio(`${this.backendUrl}${response.audio}`);
      audio.play();
      this.isPlayAudio = true;

      audio.addEventListener('ended', () => {
        audio = new Audio(`${this.backendUrl}${response.audioMeaning}`);
        audio.play();

        audio.addEventListener('ended', () => {
          audio = new Audio(`${this.backendUrl}${response.audioExample}`);
          audio.play();

          audio.addEventListener('ended', () => {
            this.isPlayAudio = false;
          });
        });
      });
    });
  }

  toggleDifficult(id: string, difficulty: string): void {
    const userId = this.authModalService.getUserId()!;
    this.userWordsService.getUserWord(userId, id).subscribe((word) => {
      console.log(word);
      if (word.userWord?.difficulty) {
        if (word.userWord?.difficulty === difficulty) {
          const obj = {
            difficulty: 'empty',
            optional: { rightAnswers: word.userWord?.optional?.rightAnswers, wrongAnswers: word.userWord?.optional?.wrongAnswers },
          };

          this.userWordsService
            .updateUserWord(userId, id, obj)
            .subscribe(() => {
              this.getAuthPage(this.page, false);
            });
        } else if (word.userWord?.difficulty !== difficulty) {
          const obj = {
            difficulty,
            optional: { rightAnswers: word.userWord?.optional?.rightAnswers, wrongAnswers: word.userWord?.optional?.wrongAnswers },
          };

          this.userWordsService
            .updateUserWord(userId, id, obj)
            .subscribe(() => {
              this.getAuthPage(this.page, false);
            });
        }
      } else {
        const obj = {
          difficulty,
          optional: { rightAnswers: 0, wrongAnswers: 0 },
        };
        this.userWordsService
          .createUserTextbookWord(userId, id, obj)
          .subscribe(() => {
            this.getAuthPage(this.page, false);
          });
      }
    });

    // if ((this.randomWords[this.wordIndex] as Word).userWord?.difficulty) {
    //   this.userWordsService
    //     .updateUserWord(userId, (this.randomWords[this.wordIndex])._id, obj)
    //     .subscribe(() => {});
    // } else {
    //   this.userWordsService
    //     .createUserWord(userId, (this.randomWords[this.wordIndex])._id, obj)
    //     .subscribe(() => {});
    // }
  }
}
