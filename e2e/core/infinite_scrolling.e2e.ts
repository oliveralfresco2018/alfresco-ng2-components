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

import LoginPage = require('../pages/adf/loginPage');
import ContentServicesPage = require('../pages/adf/contentServicesPage');

import AcsUserModel = require('../models/ACS/acsUserModel');
import FolderModel = require('../models/ACS/folderModel');

import TestConfig = require('../test.config');
import Util = require('../util/util');

import AlfrescoApi = require('alfresco-js-api-node');
import { UploadActions } from '../actions/ACS/upload.actions';

describe('Enable infinite scrolling', () => {

    let loginPage = new LoginPage();
    let contentServicesPage = new ContentServicesPage();

    let acsUser = new AcsUserModel();
    let folderModel = new FolderModel({ 'name': 'folderOne' });

    let fileNames = [], nrOfFiles = 30;
    let fileNum = 0;

    let files = {
        base: 'newFile',
        extension: '.txt'
    };

    beforeAll(async (done) => {
        let uploadActions = new UploadActions();

        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'ECM',
            hostEcm: TestConfig.adf.url
        });

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        await this.alfrescoJsApi.core.peopleApi.addPerson(acsUser);

        loginPage.loginToContentServicesUsingUserModel(acsUser);

        contentServicesPage.goToDocumentList();

        fileNames = Util.generateSeqeunceFiles(1, nrOfFiles, files.base, files.extension);

        await this.alfrescoJsApi.login(acsUser.id, acsUser.password);

        let folderUploadedModel = await uploadActions.uploadFolder(this.alfrescoJsApi, folderModel.name, '-my-');

        await uploadActions.createEmptyFiles(this.alfrescoJsApi, fileNames, folderUploadedModel.entry.id);

        done();
    });

    it('Enable infinite scrolling', () => {
        contentServicesPage.navigateToFolder(folderModel.name);
        contentServicesPage.enableInfiniteScrolling();
        contentServicesPage.clickLoadMoreButton();
        for (fileNum; fileNum < nrOfFiles; fileNum++) {
            contentServicesPage.checkContentIsDisplayed(fileNames[fileNum]);
        }
    });
});
