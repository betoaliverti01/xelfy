/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AccountForm from './pages/AccountForm';
import AccountList from './pages/AccountList';
import AppCustomization from './pages/AppCustomization';
import Catalog from './pages/Catalog';
import CatalogForm from './pages/CatalogForm';
import CategoryManager from './pages/CategoryManager';
import ClientForm from './pages/ClientForm';
import ClientsList from './pages/ClientsList';
import Dashboard from './pages/Dashboard';
import EventForm from './pages/EventForm';
import Financial from './pages/Financial';
import FinancialForm from './pages/FinancialForm';
import FinancialList from './pages/FinancialList';
import GoogleCalendarSettings from './pages/GoogleCalendarSettings';
import InventoryForm from './pages/InventoryForm';
import InventoryList from './pages/InventoryList';
import OrderForm from './pages/OrderForm';
import OrderFormEnhanced from './pages/OrderFormEnhanced';
import Orders from './pages/Orders';
import QuickAdd from './pages/QuickAdd';
import QuotationView from './pages/QuotationView';
import Receipt from './pages/Receipt';
import Schedule from './pages/Schedule';
import StoreSettings from './pages/StoreSettings';
import Storefront from './pages/Storefront';
import ToReceiveList from './pages/ToReceiveList';
import TransferForm from './pages/TransferForm';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AccountForm": AccountForm,
    "AccountList": AccountList,
    "AppCustomization": AppCustomization,
    "Catalog": Catalog,
    "CatalogForm": CatalogForm,
    "CategoryManager": CategoryManager,
    "ClientForm": ClientForm,
    "ClientsList": ClientsList,
    "Dashboard": Dashboard,
    "EventForm": EventForm,
    "Financial": Financial,
    "FinancialForm": FinancialForm,
    "FinancialList": FinancialList,
    "GoogleCalendarSettings": GoogleCalendarSettings,
    "InventoryForm": InventoryForm,
    "InventoryList": InventoryList,
    "OrderForm": OrderForm,
    "OrderFormEnhanced": OrderFormEnhanced,
    "Orders": Orders,
    "QuickAdd": QuickAdd,
    "QuotationView": QuotationView,
    "Receipt": Receipt,
    "Schedule": Schedule,
    "StoreSettings": StoreSettings,
    "Storefront": Storefront,
    "ToReceiveList": ToReceiveList,
    "TransferForm": TransferForm,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};