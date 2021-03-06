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

import TestConfig = require('../test.config');
import resources = require('../util/resources');
import LoginPage = require('../pages/adf/loginPage');
import NavigationBarPage = require('../pages/adf/navigationBarPage');
import ProcessServicesPage = require('../pages/adf/process_services/processServicesPage');
import TasksPage = require('../pages/adf/process_services/tasksPage');
import TasksListPage = require('../pages/adf/process_services/tasksListPage');
import TaskFiltersPage = require('../pages/adf/process_services/taskFiltersPage');
import TaskDetailsPage = require('../pages/adf/process_services/taskDetailsPage');

import AlfrescoApi = require('alfresco-js-api-node');
import { AppsActions } from '../actions/APS/apps.actions';
import { UsersActions } from '../actions/users.actions';
import { browser } from 'protractor';

describe('Task Filters Sorting', () => {

    let loginPage = new LoginPage();
    let navigationBarPage = new NavigationBarPage();
    let processServicesPage = new ProcessServicesPage();
    let tasksPage = new TasksPage();
    let tasksListPage = new TasksListPage();
    let taskFiltersPage = new TaskFiltersPage();
    let taskDetailsPage = new TaskDetailsPage();

    let tenantId;
    let user;
    let appId;
    let importedApp;

    let taskFilterId;

    let app = resources.Files.APP_WITH_PROCESSES;

    let tasks = [
        { name: 'Task 1 Completed', dueDate: '01/01/2019' },
        { name: 'Task 2 Completed', dueDate: '02/01/2019' },
        { name: 'Task 3 Completed', dueDate: '03/01/2019' },
        { name: 'Task 4', dueDate: '01/01/2019' },
        { name: 'Task 5', dueDate: '02/01/2019' },
        { name: 'Task 6', dueDate: '03/01/2019' }];

    beforeAll(async (done) => {
        let apps = new AppsActions();
        let users = new UsersActions();

        this.alfrescoJsApi = new AlfrescoApi({
            provider: 'BPM',
            hostBpm: TestConfig.adf.url
        });

        await this.alfrescoJsApi.login(TestConfig.adf.adminEmail, TestConfig.adf.adminPassword);

        user = await users.createTenantAndUser(this.alfrescoJsApi);
        tenantId = user.tenantId;

        await this.alfrescoJsApi.login(user.email, user.password);

        importedApp = await apps.importPublishDeployApp(this.alfrescoJsApi, app.file_location);

        let appDefinitions = await this.alfrescoJsApi.activiti.appsApi.getAppDefinitions();

        appId = appDefinitions.data.find((currentApp) => {
            return currentApp.modelId === importedApp.id;
        }).id;

        await loginPage.loginToProcessServicesUsingUserModel(user);

        navigationBarPage.clickProcessServicesButton();
        processServicesPage.checkApsContainer();
        processServicesPage.goToApp(app.title);

        tasksPage.createNewTask().addName(tasks[0].name).addDueDate(tasks[0].dueDate).clickStartButton();
        taskDetailsPage.clickCompleteTask();

        tasksPage.createNewTask().addName(tasks[1].name).addDueDate(tasks[1].dueDate).clickStartButton();
        taskDetailsPage.clickCompleteTask();

        tasksPage.createNewTask().addName(tasks[2].name).addDueDate(tasks[2].dueDate).clickStartButton();
        taskDetailsPage.clickCompleteTask();

        tasksPage.createNewTask().addName(tasks[3].name).addDueDate(tasks[3].dueDate).clickStartButton();
        tasksPage.createNewTask().addName(tasks[4].name).addDueDate(tasks[4].dueDate).clickStartButton();
        tasksPage.createNewTask().addName(tasks[5].name).addDueDate(tasks[5].dueDate).clickStartButton();

        done();

    });

    // afterAll(async(done) => {
    //     await this.alfrescoJsApi.activiti.adminTenantsApi.deleteTenant(tenantId);
    //     done();
    // });
    it('[C277254] Should display tasks under new filter from newest to oldest when they are completed', () => {
        browser.controlFlow().execute(async () => {
            let newFilter = new this.alfrescoJsApi.activiti.UserProcessInstanceFilterRepresentation();
            newFilter.name = 'Newest first';
            newFilter.appId = appId;
            newFilter.icon = 'glyphicon-filter';
            newFilter.filter = { sort: 'created-desc', state: 'completed', assignment: 'involved' };

            let result = await this.alfrescoJsApi.activiti.userFiltersApi.createUserTaskFilter(newFilter);

            taskFilterId = result.id;
            return result;
        });

        browser.refresh();

        taskFiltersPage.clickTaskFilter('Newest first');

        expect(tasksListPage.taskOnTaskListInPosition(1)).toBe(tasks[2].name);
        expect(tasksListPage.taskOnTaskListInPosition(2)).toBe(tasks[1].name);
        expect(tasksListPage.taskOnTaskListInPosition(3)).toBe(tasks[0].name);

    });

    it('[C277255] Should display tasks under new filter from oldest to newest when they are completed', () => {
        browser.controlFlow().execute(async () => {
            let newFilter = new this.alfrescoJsApi.activiti.UserProcessInstanceFilterRepresentation();
            newFilter.name = 'Newest last';
            newFilter.appId = appId;
            newFilter.icon = 'glyphicon-filter';
            newFilter.filter = { sort: 'created-asc', state: 'completed', assignment: 'involved' };

            let result = await this.alfrescoJsApi.activiti.userFiltersApi.createUserTaskFilter(newFilter);

            taskFilterId = result.id;
            return result;
        });

        browser.refresh();

        taskFiltersPage.clickTaskFilter('Newest last');

        expect(tasksListPage.taskOnTaskListInPosition(1)).toBe(tasks[0].name);
        expect(tasksListPage.taskOnTaskListInPosition(2)).toBe(tasks[1].name);
        expect(tasksListPage.taskOnTaskListInPosition(3)).toBe(tasks[2].name);
    });

    it('[C277256] Should display tasks under new filter from closest due date to farthest when they are completed', () => {
        browser.controlFlow().execute(async () => {
            let newFilter = new this.alfrescoJsApi.activiti.UserProcessInstanceFilterRepresentation();
            newFilter.name = 'Due first';
            newFilter.appId = appId;
            newFilter.icon = 'glyphicon-filter';
            newFilter.filter = { sort: 'due-desc', state: 'completed', assignment: 'involved' };

            let result = await this.alfrescoJsApi.activiti.userFiltersApi.createUserTaskFilter(newFilter);

            taskFilterId = result.id;
            return result;
        });

        browser.refresh();

        taskFiltersPage.clickTaskFilter('Due first');

        expect(tasksListPage.taskOnTaskListInPosition(1)).toBe(tasks[2].name);
        expect(tasksListPage.taskOnTaskListInPosition(2)).toBe(tasks[1].name);
        expect(tasksListPage.taskOnTaskListInPosition(3)).toBe(tasks[0].name);
    });

    it('[C277257] Should display tasks under new filter from oldest to newest when they are completed', () => {
        browser.controlFlow().execute(async () => {
            let newFilter = new this.alfrescoJsApi.activiti.UserProcessInstanceFilterRepresentation();
            newFilter.name = 'Due last';
            newFilter.appId = appId;
            newFilter.icon = 'glyphicon-filter';
            newFilter.filter = { sort: 'due-asc', state: 'completed', assignment: 'involved' };

            let result = await this.alfrescoJsApi.activiti.userFiltersApi.createUserTaskFilter(newFilter);

            taskFilterId = result.id;
            return result;
        });

        browser.refresh();

        taskFiltersPage.clickTaskFilter('Due last');

        expect(tasksListPage.taskOnTaskListInPosition(1)).toBe(tasks[0].name);
        expect(tasksListPage.taskOnTaskListInPosition(2)).toBe(tasks[1].name);
        expect(tasksListPage.taskOnTaskListInPosition(3)).toBe(tasks[2].name);
    });

    it('[C277258] Should display tasks under new filter from newest to oldest when they are open  ', () => {
        browser.controlFlow().execute(async () => {
            let newFilter = new this.alfrescoJsApi.activiti.UserProcessInstanceFilterRepresentation();
            newFilter.name = 'Newest first Open';
            newFilter.appId = appId;
            newFilter.icon = 'glyphicon-filter';
            newFilter.filter = { sort: 'created-desc', state: 'open', assignment: 'involved' };

            let result = await this.alfrescoJsApi.activiti.userFiltersApi.createUserTaskFilter(newFilter);

            taskFilterId = result.id;
            return result;
        });

        browser.refresh();

        taskFiltersPage.clickTaskFilter('Newest first Open');

        expect(tasksListPage.taskOnTaskListInPosition(1)).toBe(tasks[5].name);
        expect(tasksListPage.taskOnTaskListInPosition(2)).toBe(tasks[4].name);
        expect(tasksListPage.taskOnTaskListInPosition(3)).toBe(tasks[3].name);
    });

    it('[C277259] Should display tasks under new filter from oldest to newest when they are open', () => {
        browser.controlFlow().execute(async () => {
            let newFilter = new this.alfrescoJsApi.activiti.UserProcessInstanceFilterRepresentation();
            newFilter.name = 'Newest last Open';
            newFilter.appId = appId;
            newFilter.icon = 'glyphicon-filter';
            newFilter.filter = { sort: 'created-asc', state: 'open', assignment: 'involved' };

            let result = await this.alfrescoJsApi.activiti.userFiltersApi.createUserTaskFilter(newFilter);

            taskFilterId = result.id;
            return result;
        });

        browser.refresh();

        taskFiltersPage.clickTaskFilter('Newest last Open');

        expect(tasksListPage.taskOnTaskListInPosition(1)).toBe(tasks[3].name);
        expect(tasksListPage.taskOnTaskListInPosition(2)).toBe(tasks[4].name);
        expect(tasksListPage.taskOnTaskListInPosition(3)).toBe(tasks[5].name);
    });

    it('[C277260] Should display tasks under new filter from closest due date to farthest when they are open', () => {
        browser.controlFlow().execute(async () => {
            let newFilter = new this.alfrescoJsApi.activiti.UserProcessInstanceFilterRepresentation();
            newFilter.name = 'Due first Open';
            newFilter.appId = appId;
            newFilter.icon = 'glyphicon-filter';
            newFilter.filter = { sort: 'due-desc', state: 'open', assignment: 'involved' };

            let result = await this.alfrescoJsApi.activiti.userFiltersApi.createUserTaskFilter(newFilter);

            taskFilterId = result.id;
            return result;
        });

        browser.refresh();

        taskFiltersPage.clickTaskFilter('Due first Open');

        expect(tasksListPage.taskOnTaskListInPosition(1)).toBe(tasks[5].name);
        expect(tasksListPage.taskOnTaskListInPosition(2)).toBe(tasks[4].name);
        expect(tasksListPage.taskOnTaskListInPosition(3)).toBe(tasks[3].name);
    });

    it('[C277261] Should display tasks under new filter from oldest to newest when they are open', () => {
        browser.controlFlow().execute(async () => {
            let newFilter = new this.alfrescoJsApi.activiti.UserProcessInstanceFilterRepresentation();
            newFilter.name = 'Due last Open';
            newFilter.appId = appId;
            newFilter.icon = 'glyphicon-filter';
            newFilter.filter = { sort: 'due-asc', state: 'open', assignment: 'involved' };

            let result = await this.alfrescoJsApi.activiti.userFiltersApi.createUserTaskFilter(newFilter);

            taskFilterId = result.id;
            return result;
        });

        browser.refresh();

        taskFiltersPage.clickTaskFilter('Due last Open');

        expect(tasksListPage.taskOnTaskListInPosition(1)).toBe(tasks[3].name);
        expect(tasksListPage.taskOnTaskListInPosition(2)).toBe(tasks[4].name);
        expect(tasksListPage.taskOnTaskListInPosition(3)).toBe(tasks[5].name);

    });
});
