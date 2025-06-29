export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem('token');

    const headers = {
        ...options.headers,
        'Content-Type': 'application/json',
    };

    if (token) {
        (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('token');
        // Redirect to login page
        alert('Votre session a expiré. Veuillez vous reconnecter.');
        window.location.href = '/login';
        // Throw an error to stop further processing
        throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    return response;
};
