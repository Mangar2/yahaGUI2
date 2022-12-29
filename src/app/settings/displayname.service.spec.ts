import { TestBed } from '@angular/core/testing';

import { DisplaynameService } from './displayname.service';

describe('DisplaynameService', () => {
  let service: DisplaynameService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DisplaynameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
