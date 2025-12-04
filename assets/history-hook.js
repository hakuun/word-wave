(function() {
    // Save the original History methods
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    /**
     * Creates and dispatches a custom 'routechange' event.
     */
    function dispatchChangeEvent() {
        const event = new CustomEvent('routechange', { detail: { url: location.href } });
        window.dispatchEvent(event);
    }

    // Override pushState
    history.pushState = function() {
        // Execute the original function
        const result = originalPushState.apply(this, arguments);

        // Dispatch the custom event
        dispatchChangeEvent();

        // Return the result
        return result;
    };

    // Override replaceState
    history.replaceState = function() {
        const result = originalReplaceState.apply(this, arguments);
        dispatchChangeEvent();
        return result;
    };

    // Also listen for the traditional events
    window.addEventListener('popstate', dispatchChangeEvent);
    window.addEventListener('hashchange', dispatchChangeEvent);
})();