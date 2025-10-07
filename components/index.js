/**
 * Components Index File
 * 
 * Centralized export file for all reusable UI components.
 * This allows for cleaner imports throughout the application.
 * 
 * Usage:
 * import { Button, Input, Dropdown } from '../components';
 * 
 * Instead of:
 * import Button from '../components/Button';
 * import Input from '../components/Input';
 * import Dropdown from '../components/Dropdown';
 */

// Core UI Components
export { default as Button } from './Button';
export { default as Dropdown } from './Dropdown';
export { default as Input } from './Input';

// Export all components as a single object for flexibility
export default {
  Button: require('./Button').default,
  Input: require('./Input').default,
  Dropdown: require('./Dropdown').default,
};