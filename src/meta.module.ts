import {ModuleWithProviders, NgModule, Optional, SkipSelf} from '@angular/core';
import {RouterModule} from '@angular/router';
import {MetaService, MetaServiceConfig} from './meta.service';

@NgModule({imports: [RouterModule], declarations: [], providers: [MetaService], exports: []})
export class MetaModule {
  static forRoot(config: MetaServiceConfig): ModuleWithProviders {
    return {ngModule: MetaModule, providers: [{provide: MetaServiceConfig, useValue: config}]};
  }

  constructor(@Optional() @SkipSelf() parentModule: MetaModule) {
    if (parentModule) {
      throw new Error('MetaModule is already loaded. Import it in the AppModule only');
    }
  }
}
