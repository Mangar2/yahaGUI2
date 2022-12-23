# Install

## Use HttpClientModule

Import the HttpClientModule in the app.module, before using the HttpClient in a service.
```
import { HttpClientModule } from '@angular/common/http';
imports:[HttpClientModule,  ]
```