import { Component } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.less']
})
export class HeaderComponent {

  topicChunks: string[] = []

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.subscribeToQueryParameter();
  }

  /**
   * Subscribes to the "topic" query parameters and updates the view on change
   */
  private subscribeToQueryParameter() {
    this.route.queryParamMap.subscribe(params => {
      const topic = params.get('topic');
      if (topic) {
        this.topicChunks = topic.split('/');
      } else {
        this.topicChunks = []
      }
    })
  }

  /**
   * Navigates to the selected index
   * @param index Selected topic index
   */
  public onClick(index: number) {
    const topic = this.topicChunks.slice(0, index).join('/');
    const navigationExtras: NavigationExtras = {
      queryParams: { topic }
    };
    this.router.navigate(['overview'], navigationExtras);
  }
}
