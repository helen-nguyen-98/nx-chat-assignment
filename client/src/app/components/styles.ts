import styled from '@emotion/styled';

export const ChatContainer = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: white;

  @media (min-width: 768px) {
    grid-template-columns: 300px 1fr;
    height: 100vh;
    width: 100%;
    background-color: #f9fafb;
  }
`;

export const ChatMainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: white;
  z-index: 10;
  overflow: hidden;

  @media (min-width: 768px) {
    height: 100%;
    width: 100%;
    border-radius: 0.5rem;
    border: 1px solid #e5e7eb;
  }
`;

export const ChatHeader = styled.div`
  flex-shrink: 0;
  background-color: white;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  min-height: 64px;
`;

export const MessageContainer = styled.div<{ isCurrentUser: boolean }>`
  display: flex;
  flex-direction: column;
  width: fit-content;
  max-width: 85%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-left: ${(props) => (props.isCurrentUser ? 'auto' : '0')};
  background-color: ${(props) => (props.isCurrentUser ? '#dbeafe' : '#f3f4f6')};
  border-bottom-${(props) => (props.isCurrentUser ? 'right' : 'left')}-radius: 0;
  word-break: break-word;

  @media (min-width: 640px) {
    max-width: 70%;
  }
`;

export const InputContainer = styled.div`
  flex-shrink: 0;
  background-color: white;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  z-index: 20;

  form {
    display: flex;
    gap: 0.5rem;
    margin: 0 auto;
  }

  input {
    flex: 1;
    min-width: 0;
  }
`;

export const UsersListContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: white;
  display: flex;
  flex-direction: column;
  z-index: 5;

  @media (min-width: 768px) {
    height: 100%;
    width: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
  }

  .users-list {
    flex: 1;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
`;
