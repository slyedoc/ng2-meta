import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

import {Inject, Injectable, Optional} from '@angular/core';
import {DOCUMENT, Title} from '@angular/platform-browser';
import {ActivatedRoute, Event as NavigationEvent, NavigationEnd, Router} from '@angular/router';

const isDefined = (val: any) => typeof val !== 'undefined';

export class MetaServiceConfig {
  /**
   * Flag to append an optional title suffix to the title.
   * Default value: false
   */
  useTitleSuffix?: boolean = false;
  /**
   * A dictionary of default meta tags and their values
   */
  defaults?: {
    /**
     * The default title, used when a route does not have its own titleSuffix.
     */
    title?: string;
    /**
     * The default titleSuffix, used when useTitleSuffix is set to true
     * and a route does not have its own titleSuffix.
     */
    titleSuffix?: string;
    [key: string]: string;
  };
}

@Injectable()
export class MetaService {
  constructor(
      private router: Router, @Inject(DOCUMENT) private document: any, private titleService: Title,
      private activatedRoute: ActivatedRoute, private metaConfig: MetaServiceConfig) {
    console.log('test');
    this.router.events.filter(event => (event instanceof NavigationEnd))
        .map(() => this._findLastChild(this.activatedRoute))
        .subscribe((routeData: any) => {
          console.log('update');
          console.log(routeData.meta);
          this._updateMetaTags(routeData.meta);
        });
  }

  private _findLastChild(activatedRoute: ActivatedRoute) {
    const snapshot = activatedRoute.snapshot;

    let child = snapshot.firstChild;
    while (child.firstChild !== null) {
      child = child.firstChild;
    }

    return child.data;
  }

  private _getOrCreateMetaTag(name: string): HTMLElement {
    let el: HTMLElement = this.document.querySelector(`meta[name='${name}']`);
    if (!el) {
      el = this.document.createElement('meta');
      el.setAttribute('name', name);
      this.document.head.appendChild(el);
    }
    return el;
  }

  private _updateMetaTags(meta: any = {}) {
    if (meta.disableUpdate) {
      return false;
    }

    this.setTitle(meta.title, meta.titleSuffix);

    Object.keys(meta).forEach(key => {
      if (key === 'title' || key === 'titleSuffix') {
        return;
      }
      this.setTag(key, meta[key]);
    });

    Object.keys(this.metaConfig.defaults).forEach(key => {
      if (key in meta || key === 'title' || key === 'titleSuffix') {
        return;
      }
      this.setTag(key, this.metaConfig.defaults[key]);
    });
  }

  setTitle(title?: string, titleSuffix?: string): MetaService {
    const titleElement = this._getOrCreateMetaTag('title');
    const ogTitleElement = this._getOrCreateMetaTag('og:title');
    let titleStr = isDefined(title) ? title : (this.metaConfig.defaults['title'] || '');
    if (this.metaConfig.useTitleSuffix) {
      titleStr += isDefined(titleSuffix) ? titleSuffix : (this.metaConfig.defaults['titleSuffix'] || '');
    }

    titleElement.setAttribute('content', titleStr);
    ogTitleElement.setAttribute('content', titleStr);
    this.titleService.setTitle(titleStr);
    return this;
  }

  setTag(tag: string, value: string): MetaService {
    if (tag === 'title' || tag === 'titleSuffix') {
      throw new Error(`Attempt to set ${tag} through 'setTag': 'title' and 'titleSuffix' are reserved tag names.
      Please use 'MetaService.setTitle' instead`);
    }
    const tagElement = this._getOrCreateMetaTag(tag);
    let tagStr = isDefined(value) ? value : (this.metaConfig.defaults[tag] || '');
    tagElement.setAttribute('content', tagStr);
    if (tag === 'description') {
      let ogDescElement = this._getOrCreateMetaTag('og:description');
      ogDescElement.setAttribute('content', tagStr);
    }
    return this;
  }
}
