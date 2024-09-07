import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogHeader,DialogTitle, DialogClose,DialogFooter,DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRemoveWorkspace } from "@/features/workspace/api/use-remove-workspace";
import { useUpdateWorkspace } from "@/features/workspace/api/use-update-workspace";
import { useConfirm } from "@/hooks/use-confirm";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";


interface PreferencesModalProps {
    open : boolean;
    setOpen: (open: boolean) => void;
    initialValue: string;
}


export const PreferencesModal = ({
    open,
    setOpen,
    initialValue
}: PreferencesModalProps) => {
    const workspaceId  = useWorkspaceId();
    const router = useRouter();
    const [ConfirmDialog, confirm] = useConfirm(
        "Are you sure?",
        "This action cannot be undone."
    );

    const [value,setValue] = useState(initialValue);
    const [editOpen,setEditOpen] =useState(false)

    const {mutate: updateWorkspace, isPending: isUpdatingWorkspace} = useUpdateWorkspace();
    const {mutate: removeWorkspace, isPending: isRemovingWorkspace} = useRemoveWorkspace();
    
    const handleRemove =  async () => {
        const ok = await confirm()

        if (!ok) return;
        removeWorkspace({
            id:workspaceId
        }, {
            onSuccess: () => {
                toast.success("SyncSpace deleted!")
                router.replace("/")
            },
            onError: () => {
                toast.error("Failed to delete SyncSpace")
            }
        })
    }


    const handleEdit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        updateWorkspace({
            id: workspaceId,
            name: value,
        }, {
            onSuccess: () => {
                toast.success("SyncSpace updated!")
                setEditOpen(false);
            },
            onError: () => {
                toast.error("Failed to update SyncSpace")
            }
        })
    }

    return(
        <>
            <ConfirmDialog/>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0 bg-gray-50 overflow-hidden">
                    <DialogHeader className="p-4 border-b bg-white">
                        <DialogTitle>
                            {value}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="px-4 pb-4 flex flex-col gap-y-2">
                        <Dialog open={editOpen} onOpenChange={setEditOpen}>
                            <DialogTrigger asChild>
                                <div className="px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">
                                            SyncSpace name
                                        </p>
                                        <p className="text-sm text-[#1264a3] hover:underline font-semibold">
                                            Edit
                                        </p>
                                    </div>
                                    <p className="text-sm">
                                        {value}
                                    </p>
                                </div>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>
                                        Rename this SyncSpace
                                    </DialogTitle>
                                </DialogHeader>
                                <form className="space-y-4" onSubmit={handleEdit}>
                                    <Input value={value} disabled={isUpdatingWorkspace}onChange={(e) => setValue(e.target.value)} required autoFocus minLength={3} maxLength={80} placeholder="SyncSpace name e.g 'Work', 'Lab', 'Class'." />
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={isUpdatingWorkspace}>
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button disabled={isUpdatingWorkspace}>
                                            Save
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <button disabled={isRemovingWorkspace} onClick={handleRemove} className="flex items-center gap-x-2 px-5 py-4 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 text-rose-500">
                            <TrashIcon className="size-4"/>
                            <p className="text-sm font-semibold">
                                Delete SyncSpace
                            </p>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </>

    )
}