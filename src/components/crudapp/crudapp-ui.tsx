'use client'

import { PublicKey } from '@solana/web3.js'
import { useCrudappProgram, useCrudappProgramAccount } from './crudapp-data-access'
import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

export function CrudappCreate() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { createEntry } = useCrudappProgram();
  const { publicKey } = useWallet();

  const isFormValid = title.trim() !== '' && message.trim() !== '';

  const handleSubmit = async () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, message, owner: publicKey });
    }
  };

  if (!publicKey) {
    return (
      <div className="alert alert-warning">
        <span>You must be connected to a wallet to create a journal entry.</span>
      </div>
    );
  }

  return (
   <div className="align-center">
    <div>
      <input 
      type="text" 
      placeholder="Title" 
      value={title} 
      onChange={(e) => setTitle(e.target.value)} 
      className='input input-bordered w-full max-w-xs mb-4 align-center'
      />
      <textarea 
        placeholder="Message" 
        value={message} 
        onChange={(e) => setMessage(e.target.value)} 
        className='textarea textarea-bordered w-full max-w-xs mb-4 align-center'
      />
    </div>
      <button 
        onClick={handleSubmit} 
        disabled={!isFormValid || createEntry.isPending} 
        className='btn btn-xs lg:btn-md btn-primary'
      >
        Create Journal Entry
      </button>
   </div>
  )
}

export function CrudappList() {
  const { accounts, getProgramAccount } = useCrudappProgram()

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Make sure you have deployed the program and are on the correct cluster.</span>
      </div>
    )
  }
  return (
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            <CrudappCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No journal entries</h2>
          No entries found. Create one above to get started.
        </div>
      )}
    </div>
  )
}

function CrudappCard({ account }: { account: PublicKey }) {
  const { 
    accountQuery, updateEntry, deleteEntry


   } = useCrudappProgramAccount({
    account,
  });

  const {publicKey} = useWallet();

  const [message, setMessage] = useState("");
  const title = accountQuery.data?.title;

  const isFormValid = message.trim() !== '';

  const handleSubmit = async () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ title, message, account: publicKey });
    }
  };

  if (!publicKey) {
    return (
      <div className="alert alert-warning">
        <span>You must be connected to a wallet to create a journal entry.</span>
      </div>
    );
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg"></span> ) : (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className='space-y-6'>
        <h2 className="card-title justify-center text-3xl cursor-pointer"
        onClick={() => accountQuery.refetch()}>{accountQuery.data?.title}</h2>
        <p> {accountQuery.data?.message}</p>
        <div className="card-actions justify-around">
          <textarea
            placeholder='Message'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className='textarea textarea-bordered w-full max-w-xs'
            />    
            <button 
            onClick={handleSubmit} 
            disabled={!isFormValid || updateEntry.isPending} 
            className='btn btn-xs lg:btn-md btn-primary'>
            Update Journal Entry
            </button>
          <button 
            onClick={() => {
              const title = accountQuery.data?.title;
              if (title) {
                return deleteEntry.mutateAsync(title);
              }
            } 
          }
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
    )
  
}
