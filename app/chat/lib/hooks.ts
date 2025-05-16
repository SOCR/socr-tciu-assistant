'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { convertDbMessagesToUiMessages } from './utils';
import type { ChatSession, DBMessage } from './db/queries';
import type { Message } from '@ai-sdk/react';



const fetchMessages = async (sessionId: string): Promise<DBMessage[]> => {
    const response = await fetch(`/api/sessions/${sessionId}/messages`);
    if (!response.ok) {
        throw new Error('Failed to fetch messages');
    }
    const data: DBMessage[] = await response.json();
    return data;
}

const fetchSessionList = async (userId: string): Promise<ChatSession[]> => {
    const response = await fetch(`/api/sessions?userId=${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch session list');
    }
    const data: ChatSession[] = await response.json();
    return data;
}

const deleteSession = async (sessionId: string): Promise<void> => {
    const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete chat');
    }
}

const renameSession = async (sessionId: string, name: string): Promise<void> => {
    const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to rename chat');
    }
}

export function useFetchInitialMessages(sessionId: string | null){
    const queryKey = ['chatMessages', sessionId];

    if (!sessionId) {
        return {
            initialMessages: [],
            isLoading: false,
            isFetching: false,
            error: null,
        };
    }

    const {data:rawMessages, error, isFetching, isLoading} = useQuery<DBMessage[], Error>({
        queryKey: queryKey,
        queryFn: () => 
            {
                if (!sessionId) {
                    throw new Error('Session ID is required');
                }
                return fetchMessages(sessionId);
            },
            enabled: !!sessionId,
            staleTime: 5*60*1000,
            refetchOnWindowFocus: false,
            retry:1,
    });

    const initialMessages: Message[] = !isLoading && rawMessages
    ? convertDbMessagesToUiMessages(rawMessages)
    : []; // Return empty array while loading or if no data

    return {
        initialMessages,
        isLoading: isLoading, // Use isLoading for initial load status
        isFetching: isFetching, // Use isFetching for background refetch status
        error: error, // Pass the error object
      };

}

export function useFetchSessionList(userId: string) {
    const queryKey = ['sessionList', userId];

    const {data:sessions, error, isFetching, isLoading} = useQuery<ChatSession[], Error>({
        queryKey: queryKey,
        queryFn: () => {
            if (!userId) {
                throw new Error('User ID is required');
            }
            return fetchSessionList(userId);
        },
        enabled: !!userId,
        staleTime: 15*60*1000,
        refetchOnWindowFocus: false,
    });

    return {
        sessions: sessions ?? [],
        error: error,
        isFetching: isFetching,
        isLoading: isLoading,
    };
}

export function useDeleteSession() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (sessionId: string) => deleteSession(sessionId),
        onSuccess: (_, sessionId) => {
            // Invalidate the session list to refresh it
            queryClient.invalidateQueries({ queryKey: ['sessionList'] });
            
            // Optionally remove the session from the cache directly
            queryClient.setQueryData<ChatSession[]>(['sessionList'], (oldData) => {
                if (!oldData) return [];
                return oldData.filter(session => session.id !== sessionId);
            });
        }
    });
}

export function useRenameSession() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: ({ sessionId, name }: { sessionId: string; name: string }) => 
            renameSession(sessionId, name),
        onSuccess: (_, { sessionId, name }) => {
            // Invalidate the session list to refresh it
            queryClient.invalidateQueries({ queryKey: ['sessionList'] });
            
            // Optionally update the session in the cache directly
            queryClient.setQueryData<ChatSession[]>(['sessionList'], (oldData) => {
                if (!oldData) return [];
                return oldData.map(session => 
                    session.id === sessionId 
                        ? { ...session, title: name } 
                        : session
                );
            });
        }
    });
}



