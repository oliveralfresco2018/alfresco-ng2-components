/*!
 * @license
 * Copyright 2016 Alfresco Software, Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Injectable } from '@angular/core';
import {
    AlfrescoApi,
    ContentApi,
    NodesApi
} from 'alfresco-js-api';
import * as alfrescoApi from 'alfresco-js-api';
// import { Subject } from 'rxjs';

/* tslint:disable:adf-file-name */

@Injectable()
export class ExternalAlfrescoApiService {

    protected alfrescoApi: AlfrescoApi;

    getInstance(): AlfrescoApi {
        return this.alfrescoApi;
    }

    get contentApi(): ContentApi {
        return this.getInstance().content;
    }

    get nodesApi(): NodesApi {
        return this.getInstance().nodes;
    }

    constructor(ecmHost: string, contextRoot: string) {
        const config = {
            provider: 'ECM',
            hostEcm: ecmHost,
            authType: 'BASIC',
            contextRoot: contextRoot
        };
        this.initAlfrescoApi(config);
    }

    protected initAlfrescoApi(config) {
        if (this.alfrescoApi) {
            this.alfrescoApi.configureJsApi(config);
        } else {
            this.alfrescoApi = <AlfrescoApi> new alfrescoApi(config);
        }
    }
}
