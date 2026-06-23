import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { DialogClose } from '@radix-ui/react-dialog'
import axios from 'axios'
import { Input } from '../ui/input'
import { UserDetailContext } from '@/context/UserDetailContext'

export type Repo = {
    id: number,
    name: string,
    full_name: string,
    private_: string,
    html_url: string,
    description: string,
    updated_at: string,
    language: string,
    default_branch: string,
    owner: string,
}
function RepoDialog({ setRefreshPage }: { setRefreshPage: (refresh: boolean) => void }) {

    const [repoList, setRepoList] = useState<Repo[]>([]);
    const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { userDetail } = useContext(UserDetailContext);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        GetRepoList()
    }, [])

    const GetRepoList = async () => {
        const result = await axios.get('/api/github/repos')
        console.log(result.data);
        setRepoList(result.data)
    }

    const filteredRepoList = useMemo(() => {
        const q = searchTerm.trim().toLowerCase()

        if (!q) return repoList;
        return repoList.filter(r => r.full_name.toLowerCase().includes(q));
    }, [searchTerm, repoList])

    const SaveRepoToDB = async () => {
        if (!selectedRepo) return;

        const result = await axios.post('/api/user-repo', {
            repoId: selectedRepo.id,
            userId: userDetail?.id,
            name: selectedRepo.name,
            full_name: selectedRepo.full_name,
            private_: selectedRepo.private_,
            html_url: selectedRepo.html_url,
            description: selectedRepo.description,
            language: selectedRepo.language,
            updated_at: selectedRepo.updated_at,
            default_branch: selectedRepo.default_branch,
            owner: selectedRepo.owner,
        })

        console.log(result.data);
        setIsOpen(false);
        setRefreshPage(true)
    }

    return (
        <div>
            <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
                <DialogTrigger>
                    <Button>+ Add Repo</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Repository</DialogTitle>
                        <DialogDescription>
                            Search and select one of your github repositories
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input placeholder='Search Reops by Name' onChange={(event) => setSearchTerm(event.target.value)} />
                        {/* Repo List */}
                        <ul className='max-h-60 overflow-y-auto border rounded-xl mt-4'>
                            {filteredRepoList.map((repo) => (
                                <li className={`p-4 border-b hover:bg-gray-100 cursor-pointer
                                    ${selectedRepo?.id == repo.id ? 'bg-gray-100' : null}`}
                                    onClick={() => setSelectedRepo(repo)}
                                >{repo.full_name}</li>
                            ))}
                        </ul>
                    </div>
                    <DialogFooter className='flex gap-5'>
                        <DialogClose>Cancel</DialogClose>
                        <Button className='cursor-pointer' onClick={() => SaveRepoToDB()}>Add</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default RepoDialog
