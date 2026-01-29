export const PER_PAGE = 15;

export default class Pagination {
  // perPage and page must be private to prevent external modification
  private readonly perPage: number;
  private page: number;

  constructor(perPage = PER_PAGE) {
    this.perPage = perPage;
    this.page = 1;
  }

  get current():number {
    return this.page;
  }

  reset():void {
    this.page = 1;
  }

  next():number {
    this.page += 1;
    return this.page;
  }

  // Returns true when we've reached or passed the last page based on totalHits
  isEnd(totalHits:number):boolean {
    return this.page * this.perPage >= totalHits;
  }
}
